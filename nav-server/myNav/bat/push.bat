title һ�� git push
@echo off

cd ..

echo �ύǰ����ȷ��git��û���ƺ�
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


