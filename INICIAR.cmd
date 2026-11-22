@echo off
cd /d "%~dp0"
echo Dots+n8n - escritorio local
echo Abri http://127.0.0.1:8080 en tu navegador.
echo Manten esta ventana abierta. Para detener: Ctrl+C.
node src\serve.cjs
pause
