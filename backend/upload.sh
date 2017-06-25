#!/bin/sh

./gradlew assemble
rsync -avz build/libs/backend-all.jar a16z-hackathon:backend-all.jar

