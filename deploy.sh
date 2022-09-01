#!/bin/bash
npm run build
docker build -t arshapakkali/ecl_ui:latest .
docker push arshadpakkali/ecl_ui
ssh sg_dev "docker pull arshadpakkali/ecl_ui && docker stop ecl_ui && docker rm ecl_ui && docker run -d --name=ecl_ui -p 4000:80 arshadpakkali/ecl_ui:latest"
