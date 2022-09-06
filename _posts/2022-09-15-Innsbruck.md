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
