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

Jetzt mit dem neuen Benutzer anmelden und msql installieren:

```bash
$ sudo apt install mysql-server
```
(Für weitere Infos siehe [hier](https://www.digitalocean.com/community/tutorials/how-to-install-mysql-on-ubuntu-20-04-de)) und im Keypassfile von flinzer


