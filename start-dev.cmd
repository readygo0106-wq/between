@echo off
setlocal
set "PROJECT_ROOT=%~dp0"
set "PATH=%PROJECT_ROOT%.tools\node-v24.21.0-win-x64;%PATH%"
call npm.cmd run dev
