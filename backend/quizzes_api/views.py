import uuid
import random
from datetime import timedelta
from django.utils import timezone
from django.db.models import Avg, Count
from django.core.mail import send_mail
from django.conf import settings
from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import Colaborador, Quiz, Pregunta, Opcion, IntentoQuiz, RespuestaUsuario, PasswordResetCode
from .serializers import (
    ColaboradorSerializer,
    RegisterSerializer,
    QuizSerializer,
    QuizPlaySerializer,
    IntentoQuizSerializer,
    RankingSerializer,
    PreguntaSerializer
)

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['nombre'] = user.nombre
        token['usuario'] = user.usuario
        token['area'] = user.area
        token['avatar'] = user.avatar
        token['is_admin'] = user.is_admin
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = ColaboradorSerializer(self.user).data
        return data

class LoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                "message": "¡Colaborador registrado con éxito! Ya puedes iniciar sesión.",
                "user": ColaboradorSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# --- VISTAS PARA COLABORADORES (JUEGO) ---

class ListActiveQuizzesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        quizzes_completados = IntentoQuiz.objects.filter(
            colaborador=request.user,
            completado=True
        ).values_list('quiz_id', flat=True)
        quizzes = Quiz.objects.filter(activo=True).exclude(id__in=quizzes_completados)
        serializer = QuizSerializer(quizzes, many=True)
        return Response(serializer.data)

class JoinQuizView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def get(self, request, codigo_acceso):
        try:
            quiz = Quiz.objects.get(codigo_acceso=codigo_acceso, activo=True)
            serializer = QuizSerializer(quiz)
            return Response(serializer.data)
        except Quiz.DoesNotExist:
            return Response({"error": "El cuestionario no existe o no está activo."}, status=status.HTTP_404_NOT_FOUND)

class StartQuizView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, quiz_id):
        try:
            quiz = Quiz.objects.get(id=quiz_id, activo=True)
        except Quiz.DoesNotExist:
            return Response({"error": "El cuestionario no existe o no está activo."}, status=status.HTTP_404_NOT_FOUND)

        # Verificar si ya completó este cuestionario
        if IntentoQuiz.objects.filter(colaborador=request.user, quiz=quiz, completado=True).exists():
            return Response({"error": "Ya has realizado este cuestionario y no se permiten reintentos."}, status=status.HTTP_400_BAD_REQUEST)

        # Verificar si ya existe un intento sin completar. Si existe, lo usamos.
        intento, created = IntentoQuiz.objects.get_or_create(
            colaborador=request.user,
            quiz=quiz,
            completado=False
        )
        
        # Serializar el quiz con las preguntas del juego (sin es_correcta)
        quiz_serializer = QuizPlaySerializer(quiz)
        
        return Response({
            "intento_id": intento.id,
            "quiz": quiz_serializer.data,
            "created": created
        })

class SubmitQuizView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, intento_id):
        try:
            intento = IntentoQuiz.objects.get(id=intento_id, colaborador=request.user, completado=False)
        except IntentoQuiz.DoesNotExist:
            return Response({"error": "Intento de quiz no encontrado o ya completado."}, status=status.HTTP_404_NOT_FOUND)

        respuestas_data = request.data.get('respuestas', [])
        total_puntos = 0
        respuestas_creadas = []

        # Recorremos cada respuesta enviada por el colaborador
        for resp in respuestas_data:
            pregunta_id = resp.get('pregunta_id')
            opcion_id = resp.get('opcion_id')

            try:
                pregunta = Pregunta.objects.get(id=pregunta_id, quiz=intento.quiz)
            except Pregunta.DoesNotExist:
                continue

            opcion = None
            es_correcta = False

            if opcion_id:
                try:
                    opcion = Opcion.objects.get(id=opcion_id, pregunta=pregunta)
                    es_correcta = opcion.es_correcta
                    if es_correcta:
                        total_puntos += pregunta.puntos
                except Opcion.DoesNotExist:
                    pass

            # Guardar o actualizar la respuesta
            resp_obj, created = RespuestaUsuario.objects.update_or_create(
                intento=intento,
                pregunta=pregunta,
                defaults={
                    "opcion_seleccionada": opcion,
                    "es_correcta": es_correcta
                }
            )
            
            correct_opc = Opcion.objects.filter(pregunta=pregunta, es_correcta=True).first()
            correct_opc_id = correct_opc.id if correct_opc else None

            respuestas_creadas.append({
                "pregunta_id": pregunta_id,
                "opcion_seleccionada_id": opcion_id,
                "es_correcta": es_correcta,
                "opcion_correcta_id": correct_opc_id
            })

        # Si no se mandaron respuestas en el post final, calculamos la puntuación desde la DB
        if not respuestas_data:
            respuestas_correctas = RespuestaUsuario.objects.filter(intento=intento, es_correcta=True)
            total_puntos = sum(r.pregunta.puntos for r in respuestas_correctas)

            # Reconstruir respuestas_creadas para el response
            todas_resp = RespuestaUsuario.objects.filter(intento=intento)
            for r in todas_resp:
                correct_opc = Opcion.objects.filter(pregunta=r.pregunta, es_correcta=True).first()
                correct_opc_id = correct_opc.id if correct_opc else None
                respuestas_creadas.append({
                    "pregunta_id": r.pregunta.id,
                    "opcion_seleccionada_id": r.opcion_seleccionada.id if r.opcion_seleccionada else None,
                    "es_correcta": r.es_correcta,
                    "opcion_correcta_id": correct_opc_id
                })

        # Finalizar el intento
        intento.puntaje = total_puntos
        intento.fecha_finalizacion = timezone.now()
        intento.completado = True
        
        # Guardar feedback de capacitación si está presente en la solicitud
        if 'feedback_capacitacion_score' in request.data:
            intento.feedback_capacitacion_score = request.data.get('feedback_capacitacion_score')
        if 'feedback_preguntas_score' in request.data:
            intento.feedback_preguntas_score = request.data.get('feedback_preguntas_score')
        if 'feedback_tema_score' in request.data:
            intento.feedback_tema_score = request.data.get('feedback_tema_score')
        if 'feedback_capacitador_score' in request.data:
            intento.feedback_capacitador_score = request.data.get('feedback_capacitador_score')
        if 'feedback_comprension_score' in request.data:
            intento.feedback_comprension_score = request.data.get('feedback_comprension_score')
        if 'feedback_materiales_score' in request.data:
            intento.feedback_materiales_score = request.data.get('feedback_materiales_score')
        if 'feedback_conexion_score' in request.data:
            intento.feedback_conexion_score = request.data.get('feedback_conexion_score')
        if 'feedback_expectativas' in request.data:
            intento.feedback_expectativas = request.data.get('feedback_expectativas')
        if 'feedback_aplicacion' in request.data:
            intento.feedback_aplicacion = request.data.get('feedback_aplicacion')
        if 'feedback_comentarios' in request.data:
            intento.feedback_comentarios = request.data.get('feedback_comentarios')

        intento.save()

        # Enviar correo de sugerencias/comentarios si está provisto
        if intento.feedback_comentarios:
            try:
                subject = f"Sugerencias de Capacitación - {intento.colaborador.nombre} ({intento.colaborador.area})"
                message = (
                    f"El colaborador {intento.colaborador.nombre} ({intento.colaborador.usuario}) "
                    f"de la sección '{intento.colaborador.get_area_display()}' ha enviado las siguientes sugerencias "
                    f"para la evaluación '{intento.quiz.titulo}':\n\n"
                    f"Comentarios:\n{intento.feedback_comentarios}\n\n"
                    f"Calificaciones:\n"
                    f"- Tema: {intento.feedback_tema_score or 0}/5\n"
                    f"- Capacitador: {intento.feedback_capacitador_score or 0}/5\n"
                    f"- Comprensión: {intento.feedback_comprension_score or 0}/5\n"
                    f"- Materiales: {intento.feedback_materiales_score or 0}/5\n"
                    f"- Medio de Conexión: {intento.feedback_conexion_score or 0}/5\n"
                    f"- Cumplió Expectativas: {intento.feedback_expectativas or 'N/A'}\n"
                    f"- Aplicación del Conocimiento: {intento.feedback_aplicacion or 'N/A'}\n"
                )
                from_email = intento.colaborador.correo or "no-reply@vc-corporation.com"
                send_mail(
                    subject,
                    message,
                    from_email,
                    ['diego.rengifo@vc-corporation.com'], # test recipient
                    fail_silently=True
                )
            except Exception as mail_err:
                print("Error enviando email:", mail_err)

        # Obtener ranking actual de este quiz (incluyendo en progreso)
        rankings = IntentoQuiz.objects.filter(quiz=intento.quiz).order_by('-puntaje', 'fecha_inicio')
        mi_puesto = list(rankings.values_list('id', flat=True)).index(intento.id) + 1

        return Response({
            "message": "¡Cuestionario completado con éxito!",
            "intento": IntentoQuizSerializer(intento).data,
            "respuestas_detalles": respuestas_creadas,
            "puesto": mi_puesto,
            "total_participantes": rankings.count()
        })

class SubmitAnswerView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, intento_id):
        try:
            intento = IntentoQuiz.objects.get(id=intento_id, colaborador=request.user, completado=False)
        except IntentoQuiz.DoesNotExist:
            return Response({"error": "Intento de quiz no encontrado o ya completado."}, status=status.HTTP_404_NOT_FOUND)

        pregunta_id = request.data.get('pregunta_id')
        opcion_id = request.data.get('opcion_id')

        try:
            pregunta = Pregunta.objects.get(id=pregunta_id, quiz=intento.quiz)
        except Pregunta.DoesNotExist:
            return Response({"error": "Pregunta no encontrada en este quiz."}, status=status.HTTP_404_NOT_FOUND)

        opcion = None
        es_correcta = False

        if opcion_id:
            try:
                opcion = Opcion.objects.get(id=opcion_id, pregunta=pregunta)
                es_correcta = opcion.es_correcta
            except Opcion.DoesNotExist:
                pass

        # Guardar o actualizar la respuesta
        resp_obj, created = RespuestaUsuario.objects.update_or_create(
            intento=intento,
            pregunta=pregunta,
            defaults={
                "opcion_seleccionada": opcion,
                "es_correcta": es_correcta
            }
        )

        # Recalcular puntaje acumulado para este intento
        respuestas_correctas = RespuestaUsuario.objects.filter(intento=intento, es_correcta=True)
        total_puntos = sum(r.pregunta.puntos for r in respuestas_correctas)
        intento.puntaje = total_puntos
        intento.save()

        # Obtener id de la opción correcta
        correct_opc = Opcion.objects.filter(pregunta=pregunta, es_correcta=True).first()
        opcion_correcta_id = correct_opc.id if correct_opc else None

        return Response({
            "message": "Respuesta guardada.",
            "es_correcta": es_correcta,
            "opcion_correcta_id": opcion_correcta_id,
            "puntaje_acumulado": total_puntos
        })

class QuizRankingView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, quiz_id):
        try:
            quiz = Quiz.objects.get(id=quiz_id)
        except Quiz.DoesNotExist:
            return Response({"error": "Cuestionario no encontrado."}, status=status.HTTP_404_NOT_FOUND)

        # 1. Ranking individual (incluyendo los que están en progreso para visualización en tiempo real)
        intentos = IntentoQuiz.objects.filter(quiz=quiz).order_by('-puntaje', 'fecha_inicio')
        ranking_ind_serializer = RankingSerializer(intentos, many=True)

        # 2. Ranking agrupado por Área/Departamento
        areas_stats = (
            IntentoQuiz.objects.filter(quiz=quiz)
            .values('colaborador__area')
            .annotate(
                puntaje_promedio=Avg('puntaje'),
                total_participantes=Count('id')
            )
            .order_by('-puntaje_promedio')
        )
        
        ranking_areas = []
        for area in areas_stats:
            area_code = area['colaborador__area']
            # Obtener el label legible de la tupla AREA_CHOICES
            area_label = dict(Colaborador.AREA_CHOICES).get(area_code, area_code)
            ranking_areas.append({
                "area_codigo": area_code,
                "area_nombre": area_label,
                "puntaje_promedio": round(area['puntaje_promedio'], 2),
                "participantes": area['total_participantes']
            })

        # 3. Buscar si el usuario actual ya completó este quiz y si es así, incluir sus respuestas detalladas
        mi_intento_detalles = None
        intento_usuario = IntentoQuiz.objects.filter(quiz=quiz, colaborador=request.user, completado=True).first()
        if intento_usuario:
            respuestas_detalles = []
            todas_resp = RespuestaUsuario.objects.filter(intento=intento_usuario)
            for r in todas_resp:
                correct_opc = Opcion.objects.filter(pregunta=r.pregunta, es_correcta=True).first()
                correct_opc_id = correct_opc.id if correct_opc else None
                respuestas_detalles.append({
                    "pregunta_id": r.pregunta.id,
                    "opcion_seleccionada_id": r.opcion_seleccionada.id if r.opcion_seleccionada else None,
                    "es_correcta": r.es_correcta,
                    "opcion_correcta_id": correct_opc_id
                })
            
            preguntas = Pregunta.objects.filter(quiz=quiz)
            preguntas_serializer = PreguntaSerializer(preguntas, many=True)
            
            # Puesto del usuario en el ranking
            rankings = IntentoQuiz.objects.filter(quiz=quiz).order_by('-puntaje', 'fecha_inicio')
            try:
                mi_puesto = list(rankings.values_list('id', flat=True)).index(intento_usuario.id) + 1
            except ValueError:
                mi_puesto = None

            mi_intento_detalles = {
                "intento": IntentoQuizSerializer(intento_usuario).data,
                "respuestas_detalles": respuestas_detalles,
                "preguntas": preguntas_serializer.data,
                "puesto": mi_puesto,
                "total_participantes": rankings.count()
            }

        return Response({
            "quiz": {
                "id": quiz.id,
                "titulo": quiz.titulo,
                "codigo_acceso": quiz.codigo_acceso
            },
            "ranking_individual": ranking_ind_serializer.data,
            "ranking_areas": ranking_areas,
            "mi_intento": mi_intento_detalles
        })

# --- VISTAS PARA ADMINISTRACIÓN ---

class AdminQuizListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        quizzes = Quiz.objects.filter(creado_por=request.user)
        serializer = QuizSerializer(quizzes, many=True)
        return Response(serializer.data)

    def post(self, request):
        data = request.data.copy()
        # Generar un código único si no se proporciona
        if not data.get('codigo_acceso'):
            data['codigo_acceso'] = str(uuid.uuid4())[:8].upper()
            
        serializer = QuizSerializer(data=data)
        if serializer.is_valid():
            serializer.save(creado_por=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AdminQuizDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        try:
            quiz = Quiz.objects.get(pk=pk, creado_por=request.user)
            # Para el admin, queremos detalles completos incluyendo preguntas y opciones
            preguntas = quiz.preguntas.all()
            preguntas_serializer = PreguntaSerializer(preguntas, many=True)
            quiz_serializer = QuizSerializer(quiz)
            
            return Response({
                "quiz": quiz_serializer.data,
                "preguntas": preguntas_serializer.data
            })
        except Quiz.DoesNotExist:
            return Response({"error": "Quiz no encontrado o no tienes permisos."}, status=status.HTTP_404_NOT_FOUND)

    def put(self, request, pk):
        try:
            quiz = Quiz.objects.get(pk=pk, creado_por=request.user)
            serializer = QuizSerializer(quiz, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Quiz.DoesNotExist:
            return Response({"error": "Quiz no encontrado o no tienes permisos."}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, pk):
        try:
            quiz = Quiz.objects.get(pk=pk, creado_por=request.user)
            quiz.delete()
            return Response({"message": "Quiz eliminado correctamente."}, status=status.HTTP_204_NO_CONTENT)
        except Quiz.DoesNotExist:
            return Response({"error": "Quiz no encontrado o no tienes permisos."}, status=status.HTTP_404_NOT_FOUND)

class AdminQuizQuestionsSyncView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, quiz_id):
        try:
            quiz = Quiz.objects.get(id=quiz_id, creado_por=request.user)
        except Quiz.DoesNotExist:
            return Response({"error": "Quiz no encontrado o no tienes permisos."}, status=status.HTTP_404_NOT_FOUND)

        preguntas_data = request.data.get('preguntas', [])
        
        # Eliminar preguntas antiguas y sus opciones en cascada
        quiz.preguntas.all().delete()

        # Crear nuevas preguntas y opciones
        for idx, p_data in enumerate(preguntas_data):
            texto_preg = p_data.get('texto')
            imagen_preg = p_data.get('imagen', '')
            puntos = p_data.get('puntos', 10)
            opciones_list = p_data.get('opciones', [])

            if not texto_preg:
                continue

            pregunta = Pregunta.objects.create(
                quiz=quiz,
                texto=texto_preg,
                imagen=imagen_preg,
                puntos=puntos,
                orden=idx
            )

            for o_data in opciones_list:
                texto_opc = o_data.get('texto')
                es_correcta = o_data.get('es_correcta', False)

                if not texto_opc:
                    continue

                Opcion.objects.create(
                    pregunta=pregunta,
                    texto=texto_opc,
                    es_correcta=es_correcta
                )

        return Response({"message": "Preguntas y opciones sincronizadas con éxito."})

# Vista de estadísticas generales para el panel administrador
class AdminStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        my_quizzes = Quiz.objects.filter(creado_por=request.user)
        total_quizzes = my_quizzes.count()
        total_colaboradores = Colaborador.objects.filter(is_admin=False).count()
        total_intentos = IntentoQuiz.objects.filter(quiz__in=my_quizzes, completado=True).count()
        
        # Quizzes más activos
        quizzes_activos = (
            my_quizzes.annotate(intentos_count=Count('intentos'))
            .order_by('-intentos_count')[:5]
        )
        quizzes_activos_data = []
        for q in quizzes_activos:
            quizzes_activos_data.append({
                "id": q.id,
                "titulo": q.titulo,
                "intentos": q.intentos_count
            })

        # Participaciones por área (en mis quizzes)
        areas_stats = (
            IntentoQuiz.objects.filter(quiz__in=my_quizzes, completado=True)
            .values('colaborador__area')
            .annotate(count=Count('id'))
            .order_by('-count')
        )
        areas_data = []
        for a in areas_stats:
            area_label = dict(Colaborador.AREA_CHOICES).get(a['colaborador__area'], a['colaborador__area'])
            areas_data.append({
                "area": area_label,
                "cantidad": a['count']
            })

        return Response({
            "total_quizzes": total_quizzes,
            "total_colaboradores": total_colaboradores,
            "total_intentos": total_intentos,
            "quizzes_mas_activos": quizzes_activos_data,
            "participacion_por_area": areas_data
        })


class ColaboradorUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request):
        user = request.user
        nombre = request.data.get('nombre')
        correo = request.data.get('correo')
        area = request.data.get('area')

        if not nombre or not correo or not area:
            return Response({"error": "Todos los campos (Nombre, Correo, Área) son obligatorios."}, status=status.HTTP_400_BAD_REQUEST)

        if Colaborador.objects.filter(correo=correo).exclude(id=user.id).exists():
            return Response({"error": "El correo electrónico ya está registrado por otro colaborador."}, status=status.HTTP_400_BAD_REQUEST)

        user.nombre = nombre
        user.correo = correo
        user.area = area
        user.save()

        return Response({
            "message": "Datos de perfil actualizados con éxito.",
            "user": ColaboradorSerializer(user).data
        })

class ColaboradorChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request):
        user = request.user
        new_password = request.data.get('password')

        if not new_password or len(new_password) < 6:
            return Response({"error": "La contraseña debe tener al menos 6 caracteres."}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()

        return Response({"message": "Contraseña actualizada con éxito."})


# --- RECUPERACIÓN DE CONTRASEÑA ---

class PasswordResetRequestView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        email_or_user = request.data.get('email_or_user', '').strip()
        if not email_or_user:
            return Response({"error": "Por favor ingresa tu correo electrónico o usuario."}, status=status.HTTP_400_BAD_REQUEST)

        colaborador = Colaborador.objects.filter(correo__iexact=email_or_user).first()
        if not colaborador:
            colaborador = Colaborador.objects.filter(usuario__iexact=email_or_user).first()

        if not colaborador:
            return Response({"error": "No encontramos ninguna cuenta registrada con esa información."}, status=status.HTTP_404_NOT_FOUND)

        if not colaborador.correo:
            return Response({"error": "Esta cuenta no tiene un correo electrónico registrado para recuperar la contraseña."}, status=status.HTTP_400_BAD_REQUEST)

        # Generar código de 5 dígitos aleatorio
        codigo = f"{random.randint(10000, 99999)}"

        # Marcar códigos previos no usados como usados
        PasswordResetCode.objects.filter(colaborador=colaborador, usado=False).update(usado=True)

        PasswordResetCode.objects.create(
            colaborador=colaborador,
            codigo=codigo
        )

        asunto = "Código de Recuperación de Contraseña - Corporate Quiz"
        mensaje = f"""Hola {colaborador.nombre},

Recibimos una solicitud para restablecer la contraseña de tu cuenta ({colaborador.usuario}).

Tu código de verificación de 5 dígitos es:

  >>>  {codigo}  <<<

Este código tiene una validez de 15 minutos. Si no solicitaste este cambio, puedes ignorar este correo.

Atentamente,
El equipo de Corporate Quiz
"""
        try:
            send_mail(
                asunto,
                mensaje,
                settings.DEFAULT_FROM_EMAIL,
                [colaborador.correo],
                fail_silently=False,
            )
            return Response({
                "message": f"Código enviado con éxito al correo {colaborador.correo[:3]}***@***.",
                "email": colaborador.correo,
                "usuario": colaborador.usuario
            }, status=status.HTTP_200_OK)
        except Exception as e:
            print(f"Error al enviar correo SMTP: {str(e)}")
            if settings.DEBUG:
                return Response({
                    "message": f"Código generado ({codigo}). Nota: El servidor de correo no está configurado en entorno local, pero el código es válido.",
                    "debug_code": codigo,
                    "email": colaborador.correo,
                    "usuario": colaborador.usuario
                }, status=status.HTTP_200_OK)
            return Response({
                "error": "Ocurrió un problema al enviar el correo. Por favor contacta al administrador."
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PasswordResetConfirmView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        email_or_user = request.data.get('email_or_user', '').strip()
        codigo = request.data.get('codigo', '').strip()
        new_password = request.data.get('new_password', '').strip()

        if not email_or_user or not codigo or not new_password:
            return Response({"error": "Por favor completa todos los campos requeridos."}, status=status.HTTP_400_BAD_REQUEST)

        if len(new_password) < 4:
            return Response({"error": "La nueva contraseña debe tener al menos 4 caracteres."}, status=status.HTTP_400_BAD_REQUEST)

        colaborador = Colaborador.objects.filter(correo__iexact=email_or_user).first()
        if not colaborador:
            colaborador = Colaborador.objects.filter(usuario__iexact=email_or_user).first()

        if not colaborador:
            return Response({"error": "Usuario o correo no encontrado."}, status=status.HTTP_404_NOT_FOUND)

        reset_entry = PasswordResetCode.objects.filter(
            colaborador=colaborador,
            codigo=codigo,
            usado=False
        ).order_by('-creado_en').first()

        if not reset_entry:
            return Response({"error": "El código de 5 dígitos es incorrecto o ya fue utilizado."}, status=status.HTTP_400_BAD_REQUEST)

        # Verificar validez de 15 minutos
        if timezone.now() - reset_entry.creado_en > timedelta(minutes=15):
            return Response({"error": "El código ha expirado (validez de 15 minutos). Solicita uno nuevo."}, status=status.HTTP_400_BAD_REQUEST)

        colaborador.set_password(new_password)
        colaborador.save()

        reset_entry.usado = True
        reset_entry.save()

        return Response({"message": "¡Contraseña restablecida con éxito! Ya puedes iniciar sesión con tu nueva contraseña."}, status=status.HTTP_200_OK)
