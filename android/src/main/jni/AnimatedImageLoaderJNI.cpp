#include <jni.h>
#include <string>

#include "AnimatedImageLoaderCore.h"

using facebook::react::animatedimageloader::AnimatedImageLoaderCore;

extern "C" JNIEXPORT jstring JNICALL
Java_com_animatedimageloader_AnimatedImageLoaderModule_nativeDecodePlaceholderHash(
    JNIEnv* env,
    jobject /* this */,
    jstring hash,
    jstring hashType,
    jdouble width,
    jdouble height) {
  const char* hashChars = env->GetStringUTFChars(hash, nullptr);
  const char* hashTypeChars = env->GetStringUTFChars(hashType, nullptr);
  std::string result = AnimatedImageLoaderCore::decodePlaceholderHash(
      std::string(hashChars), std::string(hashTypeChars), width, height);
  env->ReleaseStringUTFChars(hash, hashChars);
  env->ReleaseStringUTFChars(hashType, hashTypeChars);
  return env->NewStringUTF(result.c_str());
}

extern "C" JNIEXPORT jstring JNICALL
Java_com_animatedimageloader_AnimatedImageLoaderModule_nativeExtractDominantColor(
    JNIEnv* env,
    jobject /* this */,
    jstring base64Bytes) {
  const char* bytesChars = env->GetStringUTFChars(base64Bytes, nullptr);
  std::string result =
      AnimatedImageLoaderCore::extractDominantColor(std::string(bytesChars));
  env->ReleaseStringUTFChars(base64Bytes, bytesChars);
  return env->NewStringUTF(result.c_str());
}
