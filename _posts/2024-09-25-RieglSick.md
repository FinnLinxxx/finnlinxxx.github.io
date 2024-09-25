Ich bin auf der InnoTrans und integriere diese Systeme (ROS2).

* ROS1/ROS2 Bridge hat für den Sick Scanner Treiber nicht funktioniert. Aber es gibt eh einen ROS2-Treiber (von clearpath direkt, branch: humble-devel):
https://github.com/clearpathrobotics/lms1xx
see also: https://docs.clearpathrobotics.com/docs/robots/accessories/sensors/lidar_2d/sick_lms111/

```bash
```

```txt
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
Die riegl.rdb-2.4.3-py3-none-linux_x86_64.whl Wheel bekommt man von der Riegl Webseite, oder ich habe sie mir selber per Email geschickt am 25.09.2024 um 14:18 (betreff: wheel riegl rdb whl
).





