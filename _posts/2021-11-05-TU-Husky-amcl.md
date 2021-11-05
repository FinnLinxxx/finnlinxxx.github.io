# Move TU-Husky with amcl

Falls im Raum gearbeitet wird, die Szene am Tablet aussuchen, bei der die GNSS Dusche mit angeht.

Husky einschalten

Wir brauchn eine Adresse im Husky-Netzwerk 192.168.178.1/24
vim /etc/hosts (sowohl auf dem Husky, als auch auf dem eigenen Computer)

´´´bash
ssh igros@192.168.188.1
pw: nachfragen
´´´

date --set="$(ssh finn@flinzer date --rfc-3339=ns)"

sudo systemctl restart ros.service

source catkin_ws/devel/setup.bash  (in jedem neuen Terminal)

im catkin_ws liegen
CMakeLists.txt  igros-core  igros-geocom  igros_husky  igros_img_proc  igros_novatel_span  rospy_message_converter  xsens_ros_mti_driver
igros_novatel_span (zuletzt eigniges modifies)

sollte anzeigen, dass ROS_IP und ROS_MASTER_URI gesetzt sind
env | grep ROS

(in jedem neuen Terminal)
export ROS_MASTER_URI=http://192.168.188.1:11311
export ROS_IP=192.168.188.177
source workspace_husky/devel/setup.bash

workspace_husky beinhaltet: husky  igros_husky, wobei husky noch: husky_base  husky_bringup  husky_control  husky_description  husky_desktop  husky_gazebo  husky_msgs  husky_navigation  husky_robot  husky_simulator  husky_viz  README.md
beinhaltet (noetic Branch)

(auf dem Husky, aber eigentlich nur wenn steuerung broken, so wie jetzt grade)
 export HUSKY_LOGITECH=1
roslaunch husky_control teleop.launch

---

rosrun rviz rviz (und dann eine passende config laden, oder map, laserscan, tf, posearray, posewithcovarianz (jeweils by topic, hinzufügen).
in rviz jetzt 2d pose estimate aufwählen und auf der Karte den Ort und die Richtung anklicken (laserscann und parikel erscheinen)

$ rosrun igros_husky read_points.py
(jetzt in rviz die anzufahrenden Orte auswählen indem man "2d nav goal" setzt (read_points erzeugt eine txt mit diesen Posen))
(wenn fertig strg+c drücken)
$ rosrun igros_husky points2tf.py
(die anzufahrenden Posen sollten als TFs angezeigt werden)

$ rosrun igros_husky path_following_server_amcl.py
und
jetzt gehts los
$ rosrun igros_husky path_client.py
(AHCTUNG! im notfall den roten Knopf auf dem Husky drücken, oder strg+c beim Path client)










