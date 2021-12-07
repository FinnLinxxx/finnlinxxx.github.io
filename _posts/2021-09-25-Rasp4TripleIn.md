# Install Ubuntu HEADLESS
Einiges, dass ich hier durchführe, habe ich aus meinen Erfahrungen zur Erzeugung eines Lauffähigen Linux-Systems 
mit ROS Unterstützung für [AKIG 2020](https://finnlinxxx.github.io/RaspRos4/).

```bash
$ sudo snap install rpi-imager
$ rpi-imager
```

Genaueres zur Installation kann man [hier](https://ubuntu.com/tutorials/how-to-install-ubuntu-on-your-raspberry-pi#1-overview) nachlesen.


Nach Beenden Karte in Raspberry und dieses mit LAN-Kabel an einen Router, der im selben Netz hängt wie der Laptop mit dem man später arbeiten möchte.
Wir benötigen jetzt die IP Adresse, die nach dem anschließen des Stroms für das hochgefahrene System vergeben wurde. Ein WLAN kann noch zu einem
späteren Zeitpunkt einfacher eingerichtet werden. Die IP kann im Router ausgelesen oder über 
```bash
$ nmap -sP 192.168.0.0/24
``` 
können mögliche bzw. erreichbare IPs im Netz gefunden werden. Die richtige IP kann dann über ssh angesprochen werden, mit dem Benutzernamen "ubuntu",
das Passwort ist beim ersten erreichen ebenfalls "ubuntu", kann aber mit der ersten Ausführung neu gesetzt werden.
```bash
$ ssh ubuntu@192.168.0.193
```
(wenn die IP 192.168.0.193 lautet). Das uns gewählte Passwort lautet ca. i******3
Jetzt erst einmal unattendes-upgrade ausschalten, das nervt (wie Windows).

```bash
$ sudo vim /etc/apt/apt.conf.d/10periodic
```
Da soll komplett folgendes stehen.
```vim
APT::Periodic::Update-Package-Lists "0";
APT::Periodic::Download-Upgradeable-Packages "0";
APT::Periodic::AutocleanInterval "0";
APT::Periodic::Unattended-Upgrade "0";
```

Go into .bashrc and remove numbers from HISTSIZE AND HISTFILESIZE to gain infinite bash_history.

```bash
# for setting history length see HISTSIZE and HISTFILESIZE in bash(1)
HISTSIZE=
HISTFILESIZE=
```

Neu starten und nach einiger Zeit neu anmelden, der IP sollte erhalten bleiben, ändert sich aber möglicherweise:
```bash
$ sudo shutdown -r now
```
Erneut mit ssh verbinden, falls mal was schief laufen sollte, im Zweifel einfach Strom abziehen und neu anstecken:
```bash
$ ssh ubuntu@192.168.0.193
```

```bash
$ sudo apt update
$ sudo apt upgrade
```
Das dauert womöglich einige Zeit.

---

Jetzt installieren wird noch die Essiantials.

```bash
$ sudo apt install suckless-tools build-essential
```

Nun richten wir einen Desktop-Manager ein, einen simplen wie Xubuntu, der auch xrdp unterstützt.

```bash
$ sudo apt update
$ sudo apt install xubuntu-desktop
$ sudo apt install xrdp
$ sudo systemctl status xrdp
$ sudo adduser xrdp ssl-cert
$ sudo systemctl restart xrdp
$ sudo ufw allow from 192.168.0.0/16 to any port 3389
```

```bash
$ sudo apt install terminator
```

Es funktionierte jetzt erst nachdem ich die startwm angepasst hatte. Dafür habe ich alles darin auskommentiert und stattdessen den Textteil unten hinein getan.
```vim
$ vim /etc/xrdp/startwm.sh

#!/bin/sh
if [ -r /etc/default/locale ]; then
  . /etc/default/locale
  export LANG LANGUAGE
fi

# default (= ubuntu)
#. /etc/X11/Xsession

# unity 2d
#echo "gnome-session --session=ubuntu-2d" > ~/.xsession
#. /etc/X11/Xsession

# xfce
startxfce4

exit(0)
```


```bash
$ sudo apt install xfce4 xfce4-terminal
$ sudo shutdown -r now
```

Evtl. ist ein Neustart des xrdp-service nötig
```bash
$ sudo systemctl restart xrdp
```

Jetzt kann man sich mit KRDC zum Beispiel verbinden, Verbindungsart ist `rdp://ubuntu@192.168.0.115`


Nun habe ich einen neuen Benutzer angelegt, wie das geht ist [hier](https://www.digitalocean.com/community/tutorials/how-to-create-a-new-sudo-enabled-user-on-ubuntu-18-04-quickstart-de) beschrieben. Der neue Benutzername lautet igscan, dass Passwort ist flinzer bekannt.

```bash
$ sudo usermod -aG ubuntu igscan
$ sudo usermod -aG adm igscan
$ sudo usermod -aG dialout igscan
$ sudo usermod -aG cdrom igscan
$ sudo usermod -aG floppy igscan
$ sudo usermod -aG audio igscan
$ sudo usermod -aG dip igscan
$ sudo usermod -aG video igscan
$ sudo usermod -aG plugdev igscan
$ sudo usermod -aG netdev igscan
$ sudo usermod -aG lxd igscan
$ sudo usermod -aG sudo igscan
$ sudo usermod -aG xrdp igscan
$ sudo usermod -aG users igscan
$ sudo usermod -aG tty igscan
$ sudo usermod -aG lpadmin igscan
```
Neustarten, damit die Gruppen wirksam werden.
```bash
$ sudo shutdown -r now
```

--- 

Jetzt mit dem neuen Benutzer anmelden und mysql installieren:

```bash
$ sudo apt install mysql-server
```
(Für weitere Infos siehe [hier](https://www.digitalocean.com/community/tutorials/how-to-install-mysql-on-ubuntu-20-04-de)) und im Keypassfile von flinzer

MySQL Worbench ist für arm grade nicht verfügbar.

```bash
$ sudo apt-get install python3-pip
$ sudo apt install python3-dev libmysqlclient-dev
$ sudo pip3 install mysql-connector-python
$ sudo pip3 install numpy
```

```bash
sudo apt-get install phpmyadmin
(enter, enter, enter), passwort setzen und merken!
``` 
```bash
$ sudo -H vim /etc/apache2/apache2.conf
(add this line somewhere)
Include /etc/phpmyadmin/apache.conf
$ sudo service apache2 restart
(Jetzt kann phpmyadmin über den Browser über 'http://localhost/phpmyadmin' abgerufen werden
```

Jetzt evtl. noch einen Benutzer anpassen bzw. für diesen ein Passwort vergeben, zur Bearbeitung nicht root verwenden!
Wir benutzen nur hier jetzt root (indem wir uns mit nur einmal hier mit `$ sudo mysql` als solchen anmelden ´SELECT CURRENT_USER();´). An root wurde kein Passwort 
vergeben, dies ist die einzige Möglichkeit sich als root anzumelden.
```mysql
$ sudo mysql
CREATE USER 'igscan'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON * . * TO 'igscan'@'localhost';
ALTER USER 'igscan'@'localhost' IDENTIFIED BY 'newpassword';
FLUSH PRIVILEGES;
EXIT;
```

```mysql
$ sudo mysql
CREATE DATABASE triple_in;
USE triple_in;
SHOW DATABASES;
```

`CREATE TABLE device_2921 (epoch INT UNSIGNED, unixtime_ros BIGINT, element_type VARCHAR(20), a0 FLOAT, a1 FLOAT, a2 FLOAT, a3 FLOAT, a4 FLOAT, a5 FLOAT, a6 FLOAT, a7 FLOAT, a8 FLOAT, a9 FLOAT, a10 FLOAT, a11 FLOAT, a12 FLOAT, a13 FLOAT, a14 FLOAT, a15 FLOAT, a16 FLOAT, a17 FLOAT, a18 FLOAT, a19 FLOAT, a20 FLOAT, a21 FLOAT, a22 FLOAT, a23 FLOAT, a24 FLOAT, a...`

(Für den vollständigen aufbau bis a999 siehe gitlab triplein projekt)

```bash
$ git clone https://git.geo.tuwien.ac.at/finnlinxxx/igros_triplein.git
```

Hier jetzt anpassen.
```bash
$ cd /home/igscan/igros_triplein/scripts/SQL
$ vim SQL_intensities.py
UDP_IP = "192.168.0.115" (zeile 36)
...connection = mysql.connector.connect(...credentials anpassen...) (zeile 75)
```

Und Go:
```bash
$ python3 SQL_intensities.py 2921
```


---
Yagmail

```bash
$ sudo pip3 install yagmail[all]
$ sudo pip3 install keyrings.alt
```

```python3
import yagmail
yagmail.register('flinzer.igscan@gmail.com', 'daspasswortauskeyfile')
yagmail.SMTP('flinzer.igscan@gmail.com').send('finn.linzer@gmail.com', 'subject', 'This is the body')
```


# Mysql (dump)

Um die Datenbank auf dem Raspberry-Pi in eine einzige Datei zu laden:
```bash
(auf dem Raspberry-pi)
$ mysqldump -u root -p triple_in > /home/igscan/sqldump/tripleinsql.sql
```

Wenn vpn aufgebaut und 997 der Port zum SSH ist.
```bash
(noch auf dem flinzer Computer)
$ cd
$ scp -P 997 igscan@10.120.3.52:/home/igscan/sqldump/tripleinsql.sql .
(von hier an auf dem ROS-Master weiter)
$ scp finn@192.168.178.100:/home/finn/tripleinsql.sql .
```

Folgende Befehle sind nach der Übertragung auf dem ROS-Master durchzuführen:

Im sql Textfile muss noch ein Format geändert werden, damit es für die neuste mysql Version lesbar wird (Bug).
```bash
$ sed -i tripleinsql.sql -e 's/utf8mb4_0900_ai_ci/utf8mb4_unicode_ci/g'
```

Erzeugen einer neuen Datenbank, wo die SQL eingeladen werden soll. Ich hab bisher immer eine andere genutzt, da dies funktioniert hat und ich die Integrität der anderen nicht gefährden wollte.
```bash
$ mysql -u root -p
> CREATE DATABASE `triple_in_example`;
> USE `triple_in_example`;
> EXIT
```

```bash
$ mysql -u root -p triple_in_example < /home/flinzer/tripleinsql.sql
```

---
