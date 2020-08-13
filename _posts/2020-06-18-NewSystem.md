# After Ubuntu 20.04 installation

Log 13.08.2020: Had a little accident Ubuntu-Database wise. Had to reinstall first week of August again. Things went kind of flawless

First things first
```bash
$ sudo apt update
$ sudo apt upgrade
```

Login into `tunet`-wifi, with `WPA & WPA2 Enterprise`, `Tunneled TLS`, leave the following fields empty and choose No CA 
certificate is required, `MSCHAPv2 (no EAP)`, username for me is flinzer@tuwien.ac.at, my password starts with: ig...


```bash
$ sudo apt install chromium-browser vlc vim terminator krdc blender kdenlive librecad gimp feh htop octave obs-studio obs-plugins cmake git scrot keepassx gparted xrdp nfs-common cifs-utils cloudcompare suckless-tools openssh-server python3-pip codeblocks wireshark cmatrix libcanberra-gtk-module libcanberra-gtk3-module libreoffice libreoffice-l10n-de libreoffice-help-de mysql-server 
```

Try to install mysql-workbench-community with apt, otherwise download mysql-workbench .deb from Website and install with:

```bash
$ sudo apt install ./mysql-workbench-community_8.0.21-1ubuntu20.04_amd64.deb
```

You may be able to recover more programs if you scan through your old bash_history

Install mysql-workbench from .deb as stated under https://askubuntu.com/questions/1230752/mysql-workbench-not-supporting-with-ubuntu-20-04-lts
Maybe mysql-workbench is available via apt, maybe not.

Log-in in chromium into google Account

Go into .bashrc and remove numbers from HISTSIZE AND HISTFILESIZE to gain infinite bash_history.
```bash
# for setting history length see HISTSIZE and HISTFILESIZE in bash(1)
HISTSIZE=
HISTFILESIZE=
```

Damit git nicht jedes mal nach dem Passwort fragt, sondern nur alle 3600 Sekunden (1 Stunde)
```bash
$ git config --global credential.helper 'cache --timeout=3600'
```

Generate a Public-SSH-Key:
```bash
$ ssh-keygen -t rsa -b 4096 -C "finn.linzer@tuwien.ac.at"
``` 
and send the public part to the geo-it. A password is to be chosen and to save inside my keepass.

--- 
To get a tu-net connection to terminalsservers load the (old) config file into .ssh-folder
```bash
$ ssh -f -N geo-forward
```
Afterwards you are able to connect with krdc, use `rdp:flinzer@localhost:9999`

---
Invite user into groups
```bash
sudo usermod -aG tty dialout cdrom audio video users lpadmin sambashare xrdp docker finn
sudo usermod -aG tty finn
sudo usermod -aG dialout finn
sudo usermod -aG cdrom finn
sudo usermod -aG audio finn
sudo usermod -aG video finn
sudo usermod -aG users finn
sudo usermod -aG lpadmin finn
sudo usermod -aG sambashare finn
sudo usermod -aG xrdp finn
```

--- 
base 16 follow installation guildeline for bash 
https://github.com/chriskempson/base16-shell
and for vim
https://github.com/chriskempson/base16-vim

--- 
samba shares access

add aliases to bashrc

```bash
# Network-Data Mount/uMount
alias fl='sudo mount -t cifs //GEO/Home/staff/flinzer /shares/finn/home -o username=flinzer,uid=finn,gid=finn; cd /shares/finn/home'
alias ufl='cd ~; sudo umount /shares/finn/home'

alias ig='sudo mount -t cifs //GEO/IG /shares/finn/IG -o username=flinzer,uid=finn,gid=finn; cd /shares/finn/IG'
alias uig='cd ~; sudo umount /shares/finn/IG'

alias te='sudo mount -t cifs //GEO/TEACHING /shares/finn/teaching -o username=flinzer,uid=finn,gid=finn; cd /shares/finn/teaching'
alias ute='cd ~; sudo umount /shares/finn/teaching'

alias so='sudo mount -t cifs //GEO/software /shares/finn/software -o username=flinzer,uid=finn,gid=finn; cd /shares/finn/software'
alias uso='cd ~; sudo umount /shares/finn/software'

alias ex='sudo mount -t cifs //GEO/EXCHANGE /shares/finn/exchange -o username=flinzer,uid=finn,gid=finn; cd /shares/finn/exchange'
alias uex='cd ~; sudo umount /shares/finn/exchange'

alias co='sudo mount -t cifs //GEO/COMMON /shares/finn/common -o username=flinzer,uid=finn,gid=finn; cd /shares/finn/common'
alias uco='cd ~; sudo umount /shares/finn/common'

alias flhelp='echo -e "\$fl - flinzer (H:)\n\$ig - ENGINEERING GEODESY (I:)\n\$te - TEACHING (T:)\n\$so - SOFTWARE (S:)\n\$ex - EXCHANGE (X:)\n\$co - COMMON (Q:)"'


```

create folders 
```bash
$ sudo mkdir -p /shares/finn/home
$ sudo mkdir /shares/finn/IG
$ sudo mkdir /shares/finn/teaching
$ sudo mkdir /shares/finn/software
$ sudo mkdir /shares/finn/exchange
$ sudo mkdir /shares/finn/common
```
It does work with DHCP at Freihaus, it may not work properly at Gusshaus.

---


--- 
Jag3D bzw Java14 installation

Den aktuellen Release für JAG3D kann man von Github laden (linux Version):
https://github.com/loesler/applied-geodesy/releases

Die Zip habe ich in einen extra anglegten ordner unter /Programs/JAG3D entpackt (GUI extract).

```bash
$ mkdir ~/Programs/JAG3D
```


die darin befindliche .jar kann mit Java 14 geöffnet werden, hierfür müssen wir das System noch Javamäßig updaten:
( https://computingforgeeks.com/install-oracle-java-openjdk-14-on-ubuntu-debian-linux/ )

```bash
$ sudo apt update
$ sudo add-apt-repository ppa:linuxuprising/java
$ sudo apt -y install oracle-java14-installer
$ sudo apt -y install oracle-java14-set-default
$ java -version
```

Die Java-Version sollte jetzt 14 lauten.

Starten von JAG3D dann mit
```bash
$ java -jar /home/finn/Programs/JAG3D/jag3d.jar
```
oder besser gleich als alias `alias jag3d='java -jar /home/finn/Programs/JAG3D/jag3d.jar'` in die bashrc.

---
Matlab

Nach einem Telefonat mit der GEO-IT wurde meinem Account eine persönliche Matlab Lizenz zugewiesen, die durch einloggen im Account abgerufen werden kann.
Die Installation erfolgt dann nach (online) Anleitung.

Damit Matlab das GTK Module findet habe ich nocht den Path dahin in die .bashrc geschrieben
`export GTK_PATH=/usr/lib/x86_64-linux-gnu/gtk-2.0` 

Außerdem sollte man die Keyboard shortcuts von `emacs` auf windows umstellen (strg+c, strg+v, usw.). Dafür unter Preferences>>Keyboard>>Shortcuts oben bei `active settings` im drop Menü auswählen.
https://de.mathworks.com/help/matlab/matlab_env/keyboard-shortcuts.html

Nach dem ersten Runter und wieder hoch fahren gibt es Lizenzprobleme:

(siehe: https://de.mathworks.com/matlabcentral/answers/99067-why-do-i-receive-license-manager-error-9)
The activation client is located here:

/usr/local/MATLAB/R20XXx/bin/activate_matlab.sh

*Once you have launched the MATLAB activation client:
*Select "Activate automatically using the internet."
*Log into your MathWorks account.
*Select the correct license.
*The username field should auto-populate with the correct user name. Leave it as is.
*Confirm the activation information.
*Click "finish" to complete the activation process.
*Restart MATLAB.

---
ros

Installed Flawless over Website guide.

---
ssh

Damit ich auf dem ROS-Master zb. mich über ssh von meinem Laptop aus einloggen kann, muss ich mich in der sshd_config des gegenüberliegenden Systems eintragen.
Diese Datei ist zu finden unter /etc/ssh/sshd_config. Dort dann hinter AllowUsers die Namen eingeben.

