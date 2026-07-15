import uuid
from django.utils import timezone
from django.db.models import Avg, Count
from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import Colaborador, Quiz, Pregunta, Opcion, IntentoQuiz, RespuestaUsuario
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
        intento.save()

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

        return Response({
            "quiz": {
                "id": quiz.id,
                "titulo": quiz.titulo,
                "codigo_acceso": quiz.codigo_acceso
            },
            "ranking_individual": ranking_ind_serializer.data,
            "ranking_areas": ranking_areas
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
            puntos = p_data.get('puntos', 10)
            opciones_list = p_data.get('opciones', [])

            if not texto_preg:
                continue

            pregunta = Pregunta.objects.create(
                quiz=quiz,
                texto=texto_preg,
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
