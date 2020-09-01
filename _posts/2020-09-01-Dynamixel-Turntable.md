# Setup

Für den Betrieb wurden folgende Dinge angeschaft:

https://emanual.robotis.com/docs/en/dxl/x/xm540-w270/#drive-mode

Die Kommunikation läuft über einen extra dazugehörigen Controller:
https://emanual.robotis.com/docs/en/parts/interface/u2d2/


Die Stromversorgung (12V) kann extern angeschlossen werden, indem man die Spannung einfach am Dynamixel an den passenden Pins anlegt (siehe Datenblatt), praktischer
ist aber in jedem Fall der Power-Hub, da hierfür nicht extra Kabelführungen gelegt werden müssen.
https://emanual.robotis.com/docs/en/parts/interface/u2d2_power_hub/

Die Stromversorgung erfolgt über ein eigenes Netzteil, welches am besten genug Ampere (5 A) haben sollte. Hier das Kabel abisolieren und an das U2D2 Power Hub Board
schrauben.
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

Die Workbench Dinge werden selbst komipliert (weil akutell kein ROS Package zur Verfügung stand). Die Examples und alles weitere was da steht hab ich nicht kompiliert.

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
textmäßig so aussehen kann
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

# Probebetrieb

Jetzt sollte man den Dynamixel mit folgendem Befehl drehen können.
```bash
$ rosservice call /dynamixel_workbench/dynamixel_command "command: ''
id: 1
addr_name: 'Goal_Position'
value: 0"
```
Und dann zb.
```bash
$ rosservice call /dynamixel_workbench/dynamixel_command "command: ''
id: 1
addr_name: 'Goal_Position'
value: 4000"

Als Antwort bekommt man `comm_result: True`, wenn das ganze erfolgreich war - der Motor dreht sich.

Neben `Goal_Position` gibt es noch viele weitere Optionen, Einstellungen am Dynamixel zu setzen, welche dass sind kann unter
```bash
$ cd ~/catkin_ws/src/dynamixel-workbench-msgs/dynamixel_workbench_msgs/msg
$ vim XMExt.msg
```
Nachgeschaut werden, dass XMExt für unseren Dynamixel gilt, kann hier (http://wiki.ros.org/dynamixel_workbench_msgs) entnommen werden.

WICHTIG!

Einige Einstellungen können nur gesetzt werden, wenn der Drehmoment (Torge) abgeschaltet wurde. Ich hab diesen bisher immer, wenn es um kritischere Einstellungen geht, aus prinzip 
ab (0) und wieder ein (1) geschaltet.

```bash
$ rosservice call /dynamixel_workbench/dynamixel_command "command: ''
id: 1
addr_name: 'Torque_Enable'
value: 0"
```

