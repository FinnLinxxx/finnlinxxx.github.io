# Implement Husky Robot in ROS melodic - new (30.09.2020)

Install

```bash
$ sudo apt install ros-melodic-geographic-msgs
$ sudo apt install ros-melodic-rqt-robot-steering  
$ sudo apt-get install ros-melodic-lms1xx
$ sudo apt install ros-melodic-husky-*
$ export HUSKY_GAZEBO_DESCRIPTION=$(rospack find husky_gazebo)/urdf/description.gazebo.xacro
```

Run
```bash
$ roslaunch husky_gazebo husky_empty_world.launch
$ roslaunch husky_viz view_robot.launch
$ rqt
```


# Implement Husky Robot in ROS melodic (old Version 2019)

Manuel from [here](http://wiki.ros.org/Robots/Husky)
Husky is for kinetic only, melodic is not support native. But we were able to build it by source as stated [here](https://answers.ros.org/question/292964/how-can-we-install-husky-simulator-in-melodic-ditro/).
Therefore setup workspace with src folder and git clone into it, set LMS SICK kinetic branch which works just fine.

Install

```bash
$ sudo apt install ros-melodic-geographic-msgs
$ sudo apt install ros-melodic-rqt-robot-steering  
```
Download
```bash
mkdir workspace_husky
cd workspace_
cd workspace_husky/
mkdir src
cd src/
git clone https://github.com/clearpathrobotics/LMS1xx.git
cd LMS1xx/
git checkout melodic_devel
cd ..
git clone https://github.com/husky/husky.git
git clone https://github.com/ros-visualization/interactive_marker_twist_server.git
git clone https://github.com/cra-ros-pkg/robot_localization.git
git clone https://github.com/ros-teleop/twist_mux.git           
cd ..
catkin_make
source devel/setup.bash
export HUSKY_GAZEBO_DESCRIPTION=$(rospack find husky_gazebo)/urdf/description.gazebo.xacro
```
Run
```bash
$ roslaunch husky_gazebo husky_empty_world.launch
$ roslaunch husky_viz view_robot.launch
$ rqt
```



