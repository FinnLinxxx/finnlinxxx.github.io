von der geo-it verfügbar pemkey.txt und flinzer.ovpn
```bash
$ sudo apt update
$ sudo apt upgrade
$ sudo apt-get install openvpn
$ sudo apt-get install network-manager-openvpn-gnome

$ sudo openvpn --config flinzer.ovpn
(pemkey eingeben)
```

Remote Router nun über 10.120.3.52 erreichbar:
name und passwort in meinem privaten Keypass-File oder Walter fragen (RemoteTripleinRouter).

Dort im Web-Interface auf Dial-Out > Port-Forwarding:
```txt
	  	   TCP	   996	   192.168.169.100	   3389	   immer
	  	   TCP	   906	   192.168.169.100	   3306	   immer
```
eintragen. 996 für remote Desktop (Port 3389) und 906 für mysql (Port 3306).
Remote Desktop kann mit krdc hergestellt werden über `rdp://igscan@10.120.3.52:996`
passwort muss bekannt sein.

```bash
$ sudo vim /etc/mysql/mysql.conf.d/mysqld.cnf

#bind-address     = 0.0.0.0
(sowie hier kommentieren oder ganz löschen).
$ sudo service mysql restart
```
In einer weiteren Console anmelden und dann mysql Console öffnen
```mysql
$ sudo mysql (sudo passwort eingeben)
mysql> CREATE USER 'user'@'%' IDENTIFIED BY 'PASSWORD';
mysql> GRANT ALL PRIVILEGES ON *.* TO 'user'@'%' WITH GRANT OPTION;
mysql> FLUSH PRIVILEGES;
(user und PASSWORD natürlich ändern)
```

Jetzt auf dem eigenen PC über mysql-workbench verbinden mit, hostname: 10.120.3.52, Port: 906, username: user (oder eben der gesetzte), Password: (gesetztes Passwort).



