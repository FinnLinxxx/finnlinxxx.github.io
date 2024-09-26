Ich bin auf der InnoTrans und integriere diese Systeme (ROS2).

* ROS1/ROS2 Bridge hat für den Sick Scanner Treiber nicht funktioniert. Aber es gibt eh einen ROS2-Treiber (von clearpath direkt, branch: humble-devel):
https://github.com/clearpathrobotics/lms1xx
see also: https://docs.clearpathrobotics.com/docs/robots/accessories/sensors/lidar_2d/sick_lms111/



```bash
$ source /opt/ros/galactic/setup.bash
$ source ~/my_workspace/install/setup.bash
$ vim ~/my_workspace/src/LMS1xx/configlms_111.yaml
    host: 192.168.188.50
    ...
$ cd ~/my_workspace
$ colcon build
$ cd ~/my_workspace/src/LMS1xx/launch
$ ros2 launch LMS1xx.launch.py
(neues Terminal)
$ ros2 run tf2_ros static_transform_publisher -0.2 0 -0.5 2.8 0 0 riegl_vz_socs laser_link
oder
$ ros2 run tf2_ros static_transform_publisher 0 0 0 0 0 0 map laser_link
```


Für die Riegl VZ Integration in ROS2:
https://github.com/riegllms/ros-riegl-vz
mit frame-name: riegl_vz_socs
Die riegl.rdb-2.4.3-py3-none-linux_x86_64.whl Wheel bekommt man von der Riegl Webseite, oder ich habe sie mir selber per Email (tu mail, und google drive) geschickt am 25.09.2024 um 14:18 (betreff: wheel riegl rdb whl
).

```bash
$ source /opt/ros/galactic/setup.bash
$ ros2 launch riegl_vz std_launch.py
(neues Terminal)
$ source /opt/ros/galactic/setup.bash
$ ros2 service call /scan std_srvs/srv/Trigger
(neues Terminal)
$ source /opt/ros/galactic/setup.bash
% rviz2
```

Für den ASC das gitlab (Tu Wien) Package verwenden, das hat mit galactic direkt funktionert,
Ich habe noch den magdwick-filter installiert (imu-tools), weil dann die IMU bzw. die lineraren Beschleunigungen in rviz angezeigt werden können.

```bash
$ sudo apt install ros-galactic-imu-tools
$ ros2 run sensor_rs232 sensor
(name des Topics auf /imu/data_raw ändern, damit der magdwick-filter damit arbeitet!)
vim ~/my_workspace/src/sensor_rs232/sensor_rs232/sensor_node_rs232.py
z35. self.pub_data = self.create_publisher(Imu, '/imu/data_raw', 10)
(noch den Frame)
$ ros2 run tf2_ros static_transform_publisher 0 0 0 0.95 0 0 riegl_vz_socs imu_link
```
Dann rviz2 neu starten, dann kann man auch Imu Messages plotten. Für den asc gibt es nur linear acceleration data, aber da kann man ein hacken setzen, dass die Daten angezeigt werden.
Das ist dann so ein Pfeil, noch den Haken bei "fixed frame ..." und "derotate ..." wegmachen.



