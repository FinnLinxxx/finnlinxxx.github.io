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

Weil das Package für den Riegl noch nicht im git ordentlich aufbereitet ist, hab ich den gesamten Workspace von Max gezogen (als zip, diese liegt wiederum im git). Ich hab den ordner im home Verzeichnis ausgepackt und musste noch:
```bash
$ mv workspace_vz/ ws_vz
$ cd ~/ws_vz/src/igros_husky
$ touch CATKIN_IGNORE
$ cd ~/ws_vz/src/
$ pip install -r requirements.txt
$ cd ~/ws_vz
$ rm -rf install/ build/ log/
$ colcon build
```

Durchführen, dann war das Package gebuildet, außerdem für den workspace_husky die Packages 
```bash
$ cd ~/workspace_husky/src/husky
$ git checkout noetic-devel
$ git pull origin noetic-devel
$ cd ~/workspace_husky/src/igros_husky
$ git checkout husky_kf_nav
$ git pull origin husky_kf_nav
$ cd ~/workspace_husky
$ rm -rf build/ devel/
$ source /opt/ros/noetic/setup.bash 
$ cd ~/workspace_husky/src/igros_husky
$ vim CMakeLists.txt
(aus SetPose.srv SetPosition.srv machen, ist evtl nicht mehr notwendig weil bereits teil eines vorherigen commits)
$ cd ~/workspace_husky
$ catkin_make
```

Nun builden wir die Bridge mit allen benötigten packages (ROS1 und ROS2), darauf achten dass nicht zuvor schon irgendwas ROS mäßiges gesourced wurde!
```bash
$ source /opt/ros/noetic/setup.bash 
$ source ~/ros2_galactic/install/local_setup.bash
$ source ~/ws_vz/install/local_setup.bash 
$ source ~/workspace_husky/devel/setup.bash 
$ cd ros2_galactic/
$ colcon build --symlink-install --packages-select ros1_bridge --cmake-force-configure
```

Ließ sich nicht gleich starten, wir brauchen noch den diagnostic Update
´´´bash
$ cd ~/ws_vz/src/
$ git clone https://github.com/ros/diagnostics.git
$ cd ~/ws_vz
$ rm -rf build/ install/ log/
(diagnostic_updater muss noch bearbeitet werden, wegen einem Konflikts um das Topic /diagnostics (im riegl package wird dieses Topic auch vergeben), daher ändern wir den output Topic-Name zu /riegl_diagnostics)
$ cd ~/ws_vz/src/diagnostics/diagnostic_updater/diagnostic_updater
$ vim \_diagnostic\_updater.py
```
Wir ändern folgend den code (etwa zeile 233)
```python3
    def __init__(self, node, period=1.0):
        """Construct an updater class."""
        DiagnosticTaskVector.__init__(self)
        self.node = node
        self.publisher = self.node.create_publisher(DiagnosticArray, '/riegl_diagnostics', 1)
```

Jetzt können wir builden
```bash
$ cd ~/ws_vz
$ colcon build
```

Riegl Config File (params.yaml):
```bash
$ cd ~/ws_vz/install/riegl_vz/share/riegl_vz/config
```
das sieht dann zb. so aus:
```yaml
riegl_vz_node:
  ros__parameters:
    hostname: "10.0.2.1"
    ssh_user: "user"
    ssh_password: "user"
    working_dir: "/home/finn/riegl_working_dir"
    project_name: "211130_135251"
    storage_media: 0
    meas_program: 3
    scan_pattern: [30.0,130.0,0.04,0.0,360.0,0.5]
    scan_publish: False
    scan_publish_filter: ""
    scan_publish_lod: 0
    scan_register: True
```
Riegl Befehel
```bash
$ ros2 launch riegl_vz std_launch.py
$ ros2 service call /scan std_srvs/srv/Trigger
$ ros2 service call /get_sopv riegl_vz_interfaces/srv/GetPose
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











