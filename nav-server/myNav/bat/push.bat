@echo off
title 一键 git push

cd ..

echo 注意当前路径是：%~dp0

echo 开始提交

echo 开始执行:git add
set /p declation=输入要缓存的文件，.表示全部:
git add "%declation%"

echo;
echo 开始执行:git commit -m 

set /p declation=输入修改提示信息:
git commit -m "%declation%"


echo;
echo 开始执行:git push origin master
echo 正在执行中...

git push origin master


echo;
echo 注意看返回信息，成没成功
echo;

pause
exit


