# Setup

Für den Betrieb wurden folgende Dinge angeschafft:

https://emanual.robotis.com/docs/en/dxl/x/xm540-w270/#drive-mode

Die Kommunikation läuft über einen extra dazugehörigen Controller:
https://emanual.robotis.com/docs/en/parts/interface/u2d2/


Die Stromversorgung (12V) kann extern angeschlossen werden, indem man die Spannung einfach am Dynamixel an den passenden Pins anlegt (siehe Datenblatt), praktischer
ist aber in jedem Fall der Power-Hub, da hierfür nicht extra Kabelführungen gelegt werden müssen.
https://emanual.robotis.com/docs/en/parts/interface/u2d2_power_hub/

Die Stromversorgung erfolgt über ein eigenes Netzteil, welches am besten genug Ampere (5 A) haben sollte. Hier das Kabel abisolieren und an das U2D2 Power Hub Board schrauben.
(https://www.amazon.de/gp/product/B07PGLXK4X/ref=ppx_yo_dt_b_asin_title_o03_s00?ie=UTF8&psc=1)

Die Inbetriebnahme ist dann recht unkompliziert, schnell und einfach in diesem Video und in den oberen Links aufgezeigt:
https://www.youtube.com/watch?v=FIj_NULYOKQ

# Installation

Ist ausreichend hier beschrieben, wobei das vermischen von cmake, ROS etc... sehr verwirrend ist. Daher für ROS schnell zusammengefasst (läuft unter noetic).

https://emanual.robotis.com/docs/en/software/dynamixel/dynamixel_workbench/


```bash
Installiert zunächst ROS (schadet vermutlich nicht auszuführen, obwohl ROS bereits installiert ist).
$ wget https://raw.githubusercontent.com/ROBOTIS-GIT/robotis_tools/master/install_ros_noetic.sh
$ sudo chmod 755 ./install_ros_noetic.sh
$ bash ./install_ros_noetic.sh
```

Die Dynamixel-SDK dann über ROS installieren.
```bash
$ sudo apt install ros-noetic-dynamixel-sdk
```

Die Workbench Dinge werden selbst kompiliert (weil akutell kein ROS Package zur Verfügung stand). 
Die Examples und alles weitere was da steht hab ich nicht extra mit cmake und make kompiliert, diese sind Teil des Packages.

```bash
$ cd ~
$ mkdir catkin_ws
$ cd catkin_ws
$ mkdir src
$ cd src
$ git clone https://github.com/ROBOTIS-GIT/dynamixel-workbench.git
$ git clone https://github.com/ROBOTIS-GIT/dynamixel-workbench-msgs.git
$ cd ../..
$ catkin_make
$ source devel/setup.bash
```
Mit
```bash
$ rosrun dynamixel_workbench_controllers find_dynamixel /dev/ttyUSB0
```
kann nachgeschaut werden, ob überhaupt ein Dynamixel gefunden wird (sollte unter /dev/ttyUSB0 angemeldet liegen).

Unter 
```bash
$ cd ~/catkin_ws/src/dynamixel-workbench/dynamixel_workbench_controllers/config
```
liegt eine Yaml die das Setup beschreibt, wir haben nur 1. statt 2 Dynamixel-Motoren, daher eine eigene Hinzufügen die
textmäßig so aussehen kann:
Wichtig ist hier die ID und der Name des "Gelenks", in diesem Fall: "Turn"

`$ vim one.yaml`
```vim
# You can find control table of Dynamixel on emanual (http://emanual.robotis.com/#control-table)
# Control table item has to be set Camel_Case and not included whitespace
# You are supposed to set at least Dynamixel ID
turn:
  ID: 1
  Return_Delay_Time: 0
```
Auf diese Datei muss man nun im Launch-File verweisen
```bash
$ vim ~/catkin_ws/src/dynamixel-workbench/dynamixel_workbench_controllers/launch/dynamixel_controllers.launch
```
Manchmal kann es passieren (zb nach einem Neustart), dass das Modul nicht mehr unter /dev/ttyUSB0, sondern zb /dev/ttyUSB1 angemeldet wird. Dann entweder Computer neu starten, oder das in der Launch-Datei anpassen.

# Probebetrieb

Wir starten die soeben bearbeitete Launch-Datei:
```bash
$ roslaunch dynamixel_workbench_controllers dynamixel_controllers.launch
```

Jetzt sollte man den Dynamixel mit folgendem Befehl drehen können.
```bash
$ rosservice call /dynamixel_workbench/dynamixel_command "{command: '',id: 1, addr_name: 'Goal_Position', value: 0}"
```
Und dann zb.
```bash
$ rosservice call /dynamixel_workbench/dynamixel_command "{command: '',id: 1, addr_name: 'Goal_Position', value: 4000}"
```
Als Antwort bekommt man `comm_result: True`, wenn das ganze erfolgreich war - der Motor dreht sich.


Neben `Goal_Position` gibt es noch viele weitere Optionen, Einstellungen am Dynamixel zu setzen, welche dass sind kann unter
```bash
$ cd ~/catkin_ws/src/dynamixel-workbench-msgs/dynamixel_workbench_msgs/msg
$ vim XMExt.msg
```
Nachgeschaut werden, dass XMExt für unseren Dynamixel gilt, kann hier (http://wiki.ros.org/dynamixel_workbench_msgs) entnommen werden.

Eine Übersicht, was was macht (Geschwindkeits-Einheit, etc.) erhält man unter
https://emanual.robotis.com/docs/en/dxl/x/xm540-w270/

WICHTIG!

Einige Einstellungen können nur gesetzt werden, wenn der Drehmoment (Torge) abgeschaltet wurde. Ich hab diesen bisher immer, wenn es um kritischere Einstellungen geht, aus prinzip 
ab (0) und wieder ein (1) geschaltet.

```bash
$ rosservice call /dynamixel_workbench/dynamixel_command "{command: '',id: 1, addr_name: 'Torque_Enable', value: 0}"
```

# Beispiel

```bash
$ roscore
$ roslaunch dynamixel_workbench_controllers dynamixel_controllers.launch
```
```bash
$ rosservice call /dynamixel_workbench/dynamixel_command "{command: '',id: 1, addr_name: 'Torque_Enable', value: 0}"
$ rosservice call /dynamixel_workbench/dynamixel_command "{command: '',id: 1, addr_name: 'Profile_Acceleration', value: 5}"
$ rosservice call /dynamixel_workbench/dynamixel_command "{command: '',id: 1, addr_name: 'Profile_Velocity', value: 10}"
$ rosservice call /dynamixel_workbench/dynamixel_command "{command: '',id: 1, addr_name: 'Torque_Enable', value: 1}"
```
```bash
$ rosservice call /dynamixel_workbench/dynamixel_command "{command: '',id: 1, addr_name: 'Goal_Position', value: 0}"
```

# Remote Roscore

Um über die .bashrc die ros-environemt zu setzen und eben auch über ssh direkt zu sourcen 
```bash
if [ -f ~/.bashrc ]; then
  . ~/.bashrc
fi

in die
$ nano ~/.bash_profile
schreiben
```
(https://stackoverflow.com/questions/820517/bashrc-at-ssh-login)


Um den Dynamixel von einem anderen Roscore aus steuern zu können, als dem der auf dem Tinkerboard selber laufen könnte sind folgend beschriebene Befehle notwendig. Diese beziehen sich auf den Zustand des Tinkerboards nach dem Neustart. Ein Neustart kann auch während des Betriebs über ssh erzwungen werden (`$ sudo shutdown -r now`).
Das Tinkerboard hat im Geo-Sensornetz DHCP die feste IP `192.168.178.43`, daher ist es nicht notwendig eine zuzuweisen. ssh über `$ ssh tinker@192.168.178.43`. 
Es kann sich zusätzlich lohnen das Tinkerboard mit dem Namen `tinker` unter `sudo vim /etc/hosts` auf dem eigenen Laptop mit der passenden IP einzutragen. Das Passwort ist denkbar einfach, es fängt mit t an. Wenn man möchte, dass das Tinkerboard unabhängig betrieben wird, sollte man sich über vnc verbinden und dort in der GUI die Konsole starten und Befehle dort ausführen. Vor allem Programme in der Konsole sind zur Laufzeit nicht mehr davon abhängig ob der eigene PC noch läuft. Wenn man über ssh verbindet wird nur wenn man die bash_profile angepasst hat (siehe oben) die .bashrc geladen. Neben dem Export der ROS_MASTER_URI `export ROS_MASTER_URI=http://flinzer:11311` auf beiden Kommunikationsseiten (flinzer muss dafür auf dem Tinkerboard ebenfalls unter /etc/hosts eingetragen sein oder eben einen anderen Namen), muss auch die ROS_IP gesetzt werden. Beim Tinkerboard mit `export ROS_IP=192.168.178.43`, was auch in der .bashrc gesourced wird, nur wenn das bash_profile gesetzt ist, ist das gesichert! Beim flinzer Laptop mit `export ROS_IP=192.168.178.100`, auch dies steht besser in der .bashrc. Ist die ROS_IP nicht gesetzt hat man den Umstand, dass man die Topics zwar sehen kann, aber keine Daten ausgetauscht werden.

Jetzt kann man auf dem Tinkerboard `$ roslaunch dynamixel_workbench_controllers dynamixel_controllers.launch` zum Laufen bringen und die Daten werden auf dem benannten ROS_MASTER bereitsgestellt und auch die Befehle können durchgeführt werden.

# Arbeitssicherheit

Eine Besonderheit die die Sicherheit betrifft habe ich wie folgt eingebaut: Und zwar muss ja wie geschrieben `$ dynamixel_setup` auf dem Tinkerboard ausgeführt werden, um die Geschwindigkeit zu setzten (effekt siehe alias oben). Ich setze in die .bashrc ein Befehl der `$ dynamixel_setup` selbstständig ausführt nach dem ersten setzen der .bashrc (zum Beispiel nach einem Neustart), dafür führe ich `$ dynamixel_setup` aus und setze in die bash `$ env` eine Variable die das anzeigt `SPEED_DYN_SAFETY_IS=ON/OFF`. Ob und wie sie gesetzt ist kann man abfragen über `$  env | grep SPEED`.

Bevor der Dynamixel Betrieben wird ist immer `$ dynamixel_setup` auszuführen, da ansonsten der Dynamixel mit zu hoher Geschwindigkeit verfährt! Aspekte zur Arbeitssicherheit können unten nachgelesen werden.

 vim .bashrc --> 
```bash
$ vim .bashrc

export SPEED_DYN_SAFETY_IS=OFF
alias dynamixel_setup='rosservice call /dynamixel_workbench/dynamixel_command "{command: '',id: 1, addr_name: 'Torque_Enable', value: 0}"; rosservice call /dynamixel_workbench/dynamixel_command "{command: '',id: 1, addr_name: 'Profile_Acceleration', value: 5}"; rosservice call /dynamixel_workbench/dynamixel_command "{command: '',id: 1, addr_name: 'Profile_Velocity', value: 10}"; rosservice call /dynamixel_workbench/dynamixel_command "{command: '',id: 1, addr_name: 'Torque_Enable', value: 1}"; export SPEED_DYN_SAFETY_IS=ON'
```

Nur wenn `$ dynamixel_setup` gelaufen ist in der aktuellen Instanz wird SPEED_DYN_SAFETY_IS=ON sein, und nur dann kann man später das passende python Programm starten.

