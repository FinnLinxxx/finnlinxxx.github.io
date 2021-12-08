# Husky and Riegl in perfect harmony

Wir benötigen [ROS](http://wiki.ros.org/noetic/Installation/Ubuntu) und [ROS2 (building)](https://docs.ros.org/en/galactic/Installation/Ubuntu-Development-Setup.html), da der Husky vorwiegend im ROS System und der Riegl-Scanner im ROS2 System arbeitet. Daher muss neben ROS und ROS2 auch die [Bridge](https://github.com/ros2/ros1_bridge) installiert werden.


ROS2 wird gebuildet mit dem Command:
```bash
$ cd ~/ros2_galactic/
$ colcon build --symlink-install --packages-skip ros1_bridge
( $ colcon build --symlink-install )
```
Darauf achten, den Befehl mit dem ros1_bridge skip zu verwenden, wie dies in der Bridge Anleitung steht.

Da  qt_gui_cpp und rqt_gui_cpp failen, diese Packages ignorieren.

```bash
$ cd ~/ros2_galactic/src/ros-visualization/qt_gui_core/qt_gui_cpp
$ touch CATKIN_IGNORE
$ cd ~/ros2_galactic/src/ros-visualization/rqt/rqt_gui_cpp
$ touch CATKIN_IGNORE
```

TU IG HUSKY PACKAGES:
/workspace_husky

RIEGL PACKAGES:
```bash
$ cd
$ mkdir workspace_rieglROS2
(aus dem .zip Download folgend die Dateien und Ordner ablegen)
~/workspace_rieglROS2/src/librdb
~/workspace_rieglROS2/src/riconnect
~/workspace_rieglROS2/src/riegl_vz
~/workspace_rieglROS2/src/riegl_vz_interfaces
~/workspace_rieglROS2/src/vzi_services
~/workspace_rieglROS2/src/README.md
~/workspace_rieglROS2/src/requirements.txt
```

Requirements installieren:
```bash
$ cd workspace_rieglROS2/src/
$ pip install -r requirements.txt
```




TODO: Format
Code Review - Notizen:

X-Achse beim Husky schaut vorne raus, Y nach links, Z nach oben.

igros_husky wurde gepusht in den Branch: husky_kf_nav

State Machine: 
Launch File
server_smash
scripts
* pose_initialisation_server.py: *
2x subscriber Imu Daten und GPS Antenne 
IMU ist SIunits...

IMU Koordsys, Linkshändig: X nach hinten, Z nach oben, Y nach "Rechts"

Während einer Minute IMU und GPS Daten und dann mitteln. Initale Lösung und ORIERNIERUNG: direct_gyrocompassing...
LATLON in UTM Umwandeln ( z181)

PoseStamped und (NavSatFix  - eher nicht verwendet) gepublished
(to_ros_msg: 
z23 z44 Todos hinzugefügt)

* path_following_server.py *
Bevor das 
get_target_pose() wo bin ich, wo soll ich hin
robot_pose_cb(), das ist die Callback 20 hz pro Sekunde, wo bin ich grade. (z217 subscriber muss aus der Loop).
Dann distanz und winkel berechnen, hoffentlich richtig
init_rot_flag, muss ich mich drehen bevor ich losfahre?

set_velocity() auch mit 20 hz...

if target < target_radius dann velocity 0











