@echo off
cd /d "%~dp0"
echo NOD + n8n local - laboratorio con datos ficticios
echo La primera preparacion puede tardar varios minutos.
echo Cuando indique listo, abri http://127.0.0.1:8080/connection.html
node src\local-stack.cjs start
pause
