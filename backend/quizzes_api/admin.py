from django.contrib import admin
from .models import Colaborador, Quiz, Pregunta, Opcion, IntentoQuiz, RespuestaUsuario, PasswordResetCode

@admin.register(Colaborador)
class ColaboradorAdmin(admin.ModelAdmin):
    list_display = ('usuario', 'nombre', 'area', 'correo', 'is_admin', 'is_active', 'fecha_registro')
    search_fields = ('usuario', 'nombre', 'correo')
    list_filter = ('area', 'is_admin', 'is_active')
    ordering = ('usuario',)

@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ('titulo', 'codigo_acceso', 'activo', 'tiempo_limite', 'creado_por', 'fecha_creacion')
    search_fields = ('titulo', 'codigo_acceso')
    list_filter = ('activo', 'creado_por')

@admin.register(Pregunta)
class PreguntaAdmin(admin.ModelAdmin):
    list_display = ('texto', 'quiz', 'puntos', 'orden')
    search_fields = ('texto', 'quiz__titulo')
    list_filter = ('quiz',)

@admin.register(Opcion)
class OpcionAdmin(admin.ModelAdmin):
    list_display = ('texto', 'pregunta', 'es_correcta')
    search_fields = ('texto', 'pregunta__texto')
    list_filter = ('es_correcta', 'pregunta__quiz')

@admin.register(IntentoQuiz)
class IntentoQuizAdmin(admin.ModelAdmin):
    list_display = ('colaborador', 'quiz', 'puntaje', 'completado', 'fecha_inicio', 'fecha_finalizacion')
    search_fields = ('colaborador__nombre', 'colaborador__usuario', 'quiz__titulo')
    list_filter = ('completado', 'quiz')

@admin.register(RespuestaUsuario)
class RespuestaUsuarioAdmin(admin.ModelAdmin):
    list_display = ('intento', 'pregunta', 'opcion_seleccionada', 'es_correcta')
    list_filter = ('es_correcta',)

@admin.register(PasswordResetCode)
class PasswordResetCodeAdmin(admin.ModelAdmin):
    list_display = ('colaborador', 'codigo', 'creado_en', 'usado')
    search_fields = ('colaborador__usuario', 'colaborador__nombre', 'codigo')
    list_filter = ('usado',)
