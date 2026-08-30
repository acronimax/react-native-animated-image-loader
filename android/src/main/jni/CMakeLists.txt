cmake_minimum_required(VERSION 3.13)
project(AnimatedImageLoader)

set(CMAKE_VERBOSE_MAKEFILE ON)
set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

include_directories(
  ../../../../cpp
)

add_library(
  animatedimageloader
  SHARED
  ../../../../cpp/AnimatedImageLoaderCore.cpp
  AnimatedImageLoaderJNI.cpp
)

find_library(log-lib log)

target_link_libraries(
  animatedimageloader
  ${log-lib}
)
