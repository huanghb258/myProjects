@echo off
title һ�� git push

cd ..

echo ע�⵱ǰ·���ǣ�%~dp0

echo ��ʼ�ύ

echo ��ʼִ��:git add
set /p declation=����Ҫ������ļ���.��ʾȫ��:
git add "%declation%"

echo;
echo ��ʼִ��:git commit -m 

set /p declation=�����޸���ʾ��Ϣ:
git commit -m "%declation%"


echo;
echo ��ʼִ��:git push origin master
echo ����ִ����...

git push origin master


echo;
echo ע�⿴������Ϣ����û�ɹ�
echo;

pause
exit


