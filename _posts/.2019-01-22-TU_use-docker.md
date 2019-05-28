# Use Docker in TU Wien environment

Follow these [steps](https://docs.docker.com/install/linux/docker-ce/ubuntu/#install-using-the-repository) within your ubuntu (kubuntu, ...) to install docker onto your system.

use like [this Quick-Setup](https://github.com/blang/latex-docker)

[ROS](http://wiki.ros.org/docker/Tutorials/Docker) in Docker

with mount
```bash
$ docker run -it --mount type=bind,source="$(pwd)"/ROS_bag,target=/app ros
```
