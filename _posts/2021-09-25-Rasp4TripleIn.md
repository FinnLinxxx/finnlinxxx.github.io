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
