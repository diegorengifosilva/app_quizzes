from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Colaborador, Quiz, Pregunta, Opcion, IntentoQuiz, RespuestaUsuario

User = get_user_model()



class ColaboradorSerializer(serializers.ModelSerializer):
    area_display = serializers.CharField(source='get_area_display', read_only=True)

    class Meta:
        model = Colaborador
        fields = ['id', 'nombre', 'area', 'area_display', 'usuario', 'correo', 'fecha_registro', 'is_admin', 'avatar']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    usuario = serializers.CharField(required=True)
    correo = serializers.EmailField(required=True)

    class Meta:
        model = Colaborador
        fields = ['nombre', 'area', 'usuario', 'correo', 'password', 'avatar']

    def validate(self, attrs):
        usuario = attrs.get('usuario')
        if Colaborador.objects.filter(usuario=usuario).exists():
            raise serializers.ValidationError({"usuario": "El usuario ingresado ya existe."})
            
        correo = attrs.get('correo')
        if Colaborador.objects.filter(correo=correo).exists():
            raise serializers.ValidationError({"correo": "El correo ingresado ya está registrado."})
            
        return attrs

    def create(self, validated_data):
        user = Colaborador.objects.create_user(
            usuario=validated_data['usuario'],
            nombre=validated_data['nombre'],
            area=validated_data['area'],
            password=validated_data['password'],
            correo=validated_data['correo']
        )
        user.avatar = validated_data.get('avatar', 'avatar 1.gif')
        user.save()
        return user


class OpcionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Opcion
        fields = ['id', 'texto', 'es_correcta']

class OpcionJuegoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Opcion
        # Excluir 'es_correcta' para evitar trampas en el frontend inspector
        fields = ['id', 'texto']

class PreguntaSerializer(serializers.ModelSerializer):
    opciones = OpcionSerializer(many=True, read_only=True)

    class Meta:
        model = Pregunta
        fields = ['id', 'texto', 'imagen', 'puntos', 'orden', 'opciones']

class PreguntaJuegoSerializer(serializers.ModelSerializer):
    opciones = OpcionJuegoSerializer(many=True, read_only=True)

    class Meta:
        model = Pregunta
        fields = ['id', 'texto', 'imagen', 'puntos', 'orden', 'opciones']

class QuizSerializer(serializers.ModelSerializer):
    creado_por_nombre = serializers.CharField(source='creado_por.nombre', read_only=True)
    total_preguntas = serializers.IntegerField(source='preguntas.count', read_only=True)

    class Meta:
        model = Quiz
        fields = ['id', 'titulo', 'descripcion', 'codigo_acceso', 'activo', 'tiempo_limite', 'fecha_creacion', 'creado_por_nombre', 'total_preguntas']

class QuizPlaySerializer(serializers.ModelSerializer):
    preguntas = PreguntaJuegoSerializer(many=True, read_only=True)

    class Meta:
        model = Quiz
        fields = ['id', 'titulo', 'descripcion', 'tiempo_limite', 'preguntas']

class IntentoQuizSerializer(serializers.ModelSerializer):
    colaborador_detalles = ColaboradorSerializer(source='colaborador', read_only=True)
    quiz_titulo = serializers.CharField(source='quiz.titulo', read_only=True)
    fecha_inicio_formateada = serializers.DateTimeField(source='fecha_inicio', format="%d/%m/%Y %I:%M %p", read_only=True)

    class Meta:
        model = IntentoQuiz
        fields = [
            'id', 'colaborador', 'colaborador_detalles', 'quiz', 'quiz_titulo', 
            'puntaje', 'fecha_inicio', 'fecha_finalizacion', 'completado', 
            'fecha_inicio_formateada', 'feedback_capacitacion_score', 
            'feedback_preguntas_score', 'feedback_comentarios',
            'feedback_tema_score', 'feedback_capacitador_score',
            'feedback_comprension_score', 'feedback_materiales_score',
            'feedback_conexion_score', 'feedback_expectativas',
            'feedback_aplicacion'
        ]

class RankingSerializer(serializers.ModelSerializer):
    nombre = serializers.CharField(source='colaborador.nombre')
    usuario = serializers.CharField(source='colaborador.usuario')
    area = serializers.CharField(source='colaborador.get_area_display')
    avatar = serializers.CharField(source='colaborador.avatar', default='avatar 1.gif')
    fecha_completado = serializers.DateTimeField(source='fecha_finalizacion', format="%d/%m/%Y %I:%M %p", allow_null=True, required=False)

    class Meta:
        model = IntentoQuiz
        fields = [
            'nombre', 'usuario', 'area', 'puntaje', 'fecha_completado', 'avatar',
            'feedback_capacitacion_score', 'feedback_preguntas_score', 'feedback_comentarios',
            'feedback_tema_score', 'feedback_capacitador_score',
            'feedback_comprension_score', 'feedback_materiales_score',
            'feedback_conexion_score', 'feedback_expectativas',
            'feedback_aplicacion'
        ]
