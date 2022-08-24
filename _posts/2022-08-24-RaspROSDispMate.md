Get ubuntu Mate 22.04 following these instructions:
https://github.com/lcdwiki/LCD-show-ubuntu
name igscanMate, computername igscan, pw i****123

activate ssh: https://www.ionos.de/digitalguide/server/konfiguration/ubuntu-ssh/

sudo apt install git vim 

activate vnc

https://wiki.ubuntuusers.de/Howto/Ubuntu_MATE_f%C3%BCr_den_Raspberry_Pi/#:~:text=Damit%20der%20VNC%20Server%20nach,dem%20Raspberry%20Pi%20zu%20verbinden.

deactivate unattended-upgrade


$ sudo vim /etc/apt/apt.conf.d/10periodic

APT::Periodic::Update-Package-Lists "0";
APT::Periodic::Download-Upgradeable-Packages "0";
APT::Periodic::AutocleanInterval "0";
APT::Periodic::Unattended-Upgrade "0";

$ sudo shutdown -r now

weiter mit 
https://github.com/lcdwiki/LCD-show-ubuntu

