import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from quizzes_api.models import Colaborador

# Crear admin
usuario_admin = 'admin'
if not Colaborador.objects.filter(usuario=usuario_admin).exists():
    Colaborador.objects.create_superuser(
        usuario=usuario_admin,
        nombre='Administrador General',
        area='TI',
        password='adminpassword'
    )
    print("Superusuario 'admin' creado exitosamente con contraseña 'adminpassword'.")
else:
    print("El superusuario 'admin' ya existe.")
