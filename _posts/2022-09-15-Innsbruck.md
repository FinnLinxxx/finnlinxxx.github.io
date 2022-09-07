http://wiki.ros.org/xsens_mti_driver

(download Download MT Software Suite 2021.4 (ex.) by giving your Information)

Unpack into `~/Programs` Folder: MT_Software_Suite_linux-x64_2021.4
Unpack magfieldmapper_linux-x64_2021.4.tar.gz

and

Unpack mtmanager_linux-x64_2021.4.tar.gz right there.

Install with 
```bash
$ cd ~/Programs/MT_Software_Suite_linux-x64_2021.4/
$ sudo ./mtsdk_linux-x64_2021.4.sh
```

```bash
$ cd ~
$ mkdir workspace_xsens
$ cd workspace_xsens
$ mkdir src
$ cd src
$ sudo cp -r /usr/local/xsens/xsens_ros_mti_driver/ .
$ sudo chmod -R o+rw xsens_ros_mti_driver/
$ cd ..
(follow the Instruction from the xsens_mti website)
$ pushd src/xsens_ros_mti_driver/lib/xspublic && make && popd
$ catkin_make
$ source devel/setup.bash
$ roslaunch xsens_mti_driver display.launch
```

# Husky

Die Control war irgendwie sehr komisch. Unter `igros@husky-onboard:/opt/ros/melodic/share/husky_control/config` wurde die `teleop_logitech.yaml` von irgendjemanden verändert. Ich hab sie wieder auf den Urzustand zurückgesetzt (https://github.com/husky/husky/blob/melodic-devel/husky_control/config/teleop_logitech.yaml) (melodic-devel branch, weil der Husky im September 2022 noch auf melodic läuft). Steuerung jetzt wieder über R1 und L1, sowie dem linken Joystick.

finn@flinzer -> IP: 192.168.188.177
igros@husky-onboard -> IP: 192.168.188.1

Für beide die jeweiligen Computer eintragen: \
`finn@flinzer:~$ sudo vim /etc/hosts` -> `192.168.188.1   husky-onboard` \
und \
`igros@husky-onboard:~$ sudo vim /etc/hosts` -> `192.168.188.177 flinzer` 

Für jedes eingeloggte Terminal muss für: \
`finn@flinzer:~$ export ROS_MASTER_URI=http://192.168.188.1:11311` \
`finn@flinzer:~$ export ROS_IP=192.168.188.177` \
und für \
`igros@husky-onboard:~$ export ROS_MASTER_URI=http://192.168.188.1:11311` \
`igros@husky-onboard:~$ export ROS_IP=192.168.188.1` \
eingetragen werden.

Um per ssh auf `husky-onboard` zuzugreifen:

```bash
finn@flinzer:~$ ssh igros@192.168.188.1
(passwort lautet: 2***i****!; erfragen).
```

## Start

`husky-onboard`-laptop: Zeitsynchro herstellen
```bash
$ sudo su
# date --set="$(ssh finn@flinzer date --rfc-3339=ns)"
(finn@flinzer passwort wird benötigt)
# exit
$ sudo systemctl restart ros.service
```

`husky-onboard`-laptop: Den Logitech-Joystick benennen und dann ros neustarten, damit alles clean ist (nur so funktioniert der joystick aktuell).
```bash
$ export HUSKY_LOGITECH=1
$ roslaunch husky_control teleop.launch
```

`husky-onboard`-laptop: Den SICK-Laserscanner starten
```bash
$ rosrun lms1xx LMS1xx_node _host:=192.168.188.50
([ INFO] [1662560102.285410689]: Connecting to laser at 192.168.188.50
[ INFO] [1662560102.295487631]: Connected to laser.)
```

`husky-onboard`-laptop: SICK-Laserscanner-Frame erzeugen (montiert richtig herum vorne am Husky, per Maßband gemessen).
```bash
$ rosrun tf static_transform_publisher 0.58 0 0.32 0 0 0 /base_link /laser 125
```

`flinzer`-laptop: gmapping starten (fehlermeldung können ignoriert werden)
```bash
$ roslaunch husky_navigation gmapping_demo.launch
```

`flinzer`-laptop: gmapping mit rviz visualisieren
```bash
$ roslaunch husky_viz view_robot.launch
(in rviz uncheck: Sensing/Odometrie, check: navigation, uncheck: global&local costmap)
```



