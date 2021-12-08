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
