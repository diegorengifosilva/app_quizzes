from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager

class ColaboradorManager(BaseUserManager):
    def create_user(self, usuario, nombre, area, password=None, correo=None):
        if not usuario:
            raise ValueError('El usuario es obligatorio')
        user = self.model(
            usuario=usuario,
            nombre=nombre,
            area=area,
            correo=correo
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, usuario, nombre, area, password=None):
        user = self.create_user(usuario, nombre, area, password)
        user.is_admin = True
        user.save(using=self._db)
        return user

class Colaborador(AbstractBaseUser):
    nombre = models.CharField(max_length=150)
    avatar = models.CharField(max_length=100, default='avatar 1.gif', blank=True, null=True)
    
    AREA_CHOICES = [
        # Operaciones e Ingeniería
        ('Industria', 'Industria'),
        ('Mineria', 'Minería'),
        ('Mantenimiento', 'Mantenimiento'),
        ('Petroquimica', 'Petroquímica'),
        ('Seguridad Maquinaria', 'Seguridad de Maquinaria'),

        # Administración y Finanzas
        ('Administracion', 'Administración'),
        ('Contabilidad', 'Contabilidad'),
        ('Recursos Humanos', 'Recursos Humanos'),
        ('Gerencia General', 'Gerencia General'),

        # Especialidades y Tecnología
        ('SIG HESQ', 'SIG. HESQ'),
        ('TI', 'Tecnologías de la Información (TI)'),

        # Comercial y Logística
        ('Comercial', 'Comercial'),
        ('Logistica Almacen', 'Logística - Almacén'),
    ]
    area = models.CharField(max_length=50, choices=AREA_CHOICES)
    usuario = models.CharField(max_length=50, unique=True)
    correo = models.EmailField(max_length=150, unique=True, null=True, blank=True)
    fecha_registro = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    is_admin = models.BooleanField(default=False)

    objects = ColaboradorManager()

    USERNAME_FIELD = 'usuario'
    REQUIRED_FIELDS = ['nombre', 'area']

    def __str__(self):
        return f"{self.nombre} ({self.area})"

    @property
    def is_staff(self):
        return self.is_admin

    def has_perm(self, perm, obj=None):
        return True

    def has_module_perms(self, app_label):
        return True

class Quiz(models.Model):
    titulo = models.CharField(max_length=200)
    descripcion = models.TextField(blank=True, null=True)
    codigo_acceso = models.CharField(max_length=50, unique=True)
    activo = models.BooleanField(default=True)
    tiempo_limite = models.IntegerField(default=0, help_text="Tiempo límite en minutos. 0 significa sin límite.")
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    creado_por = models.ForeignKey(Colaborador, on_delete=models.CASCADE, related_name='quizzes_creados')

    class Meta:
        verbose_name_plural = "Quizzes"
        ordering = ['-fecha_creacion']

    def __str__(self):
        return self.titulo

class Pregunta(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='preguntas')
    texto = models.TextField()
    imagen = models.TextField(blank=True, null=True, help_text="URL o Data URL (base64) de la imagen de la pregunta")
    puntos = models.IntegerField(default=1)
    orden = models.IntegerField(default=0)

    class Meta:
        ordering = ['orden', 'id']

    def __str__(self):
        return f"{self.quiz.titulo} - Pregunta: {self.texto[:30]}..."

class Opcion(models.Model):
    pregunta = models.ForeignKey(Pregunta, on_delete=models.CASCADE, related_name='opciones')
    texto = models.CharField(max_length=255)
    es_correcta = models.BooleanField(default=False)

    class Meta:
        verbose_name_plural = "Opciones"

    def __str__(self):
        return f"{self.texto} ({'Correcta' if self.es_correcta else 'Incorrecta'})"

class IntentoQuiz(models.Model):
    colaborador = models.ForeignKey(Colaborador, on_delete=models.CASCADE, related_name='intentos')
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='intentos')
    puntaje = models.IntegerField(default=0)
    fecha_inicio = models.DateTimeField(auto_now_add=True)
    fecha_finalizacion = models.DateTimeField(null=True, blank=True)
    completado = models.BooleanField(default=False)
    
    # Campos de retroalimentación de la capacitación
    feedback_capacitacion_score = models.IntegerField(null=True, blank=True, help_text="Calificación de la exposición (1-5)")
    feedback_preguntas_score = models.IntegerField(null=True, blank=True, help_text="Calificación de las preguntas (1-5)")
    feedback_tema_score = models.IntegerField(null=True, blank=True, help_text="Tema (1-5)")
    feedback_capacitador_score = models.IntegerField(null=True, blank=True, help_text="Capacitador (1-5)")
    feedback_comprension_score = models.IntegerField(null=True, blank=True, help_text="Comprensión (1-5)")
    feedback_materiales_score = models.IntegerField(null=True, blank=True, help_text="Materiales (1-5)")
    feedback_conexion_score = models.IntegerField(null=True, blank=True, help_text="Medio de Conexión (1-5)")
    feedback_expectativas = models.CharField(max_length=10, null=True, blank=True, help_text="Cumplió expectativas (Si/No)")
    feedback_aplicacion = models.CharField(max_length=100, null=True, blank=True, help_text="Aplicación del conocimiento")
    feedback_comentarios = models.TextField(null=True, blank=True)

    class Meta:
        verbose_name_plural = "Intentos de Quiz"
        ordering = ['-fecha_inicio']

    def __str__(self):
        return f"{self.colaborador.nombre} - {self.quiz.titulo} - {self.puntaje} pts"

class RespuestaUsuario(models.Model):
    intento = models.ForeignKey(IntentoQuiz, on_delete=models.CASCADE, related_name='respuestas')
    pregunta = models.ForeignKey(Pregunta, on_delete=models.CASCADE)
    opcion_seleccionada = models.ForeignKey(Opcion, on_delete=models.CASCADE, null=True, blank=True)
    es_correcta = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.intento.colaborador.nombre} - Pregunta ID {self.pregunta.id} - Correcta: {self.es_correcta}"

class PasswordResetCode(models.Model):
    colaborador = models.ForeignKey(Colaborador, on_delete=models.CASCADE, related_name='reset_codes')
    codigo = models.CharField(max_length=5)
    creado_en = models.DateTimeField(auto_now_add=True)
    usado = models.BooleanField(default=False)

    class Meta:
        verbose_name_plural = "Códigos de Restablecimiento"
        ordering = ['-creado_en']

    def __str__(self):
        return f"{self.colaborador.usuario} - Código: {self.codigo} (Usado: {self.usado})"
