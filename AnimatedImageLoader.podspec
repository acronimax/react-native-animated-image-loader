require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "AnimatedImageLoader"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.platforms    = { :ios => "15.1" }
  s.source       = { :git => package["repository"]["url"], :tag => "v#{s.version}" }

  s.source_files = "ios/**/*.{h,m,mm,cpp}", "cpp/**/*.{h,cpp}"
  s.private_header_files = "ios/**/*.h", "cpp/**/*.h"
  s.pod_target_xcconfig = {
    "HEADER_SEARCH_PATHS" => "\"$(PODS_TARGET_SRCROOT)/cpp\""
  }
  s.frameworks = "Metal", "MetalKit"
  # .metal files must go through a CocoaPods resource_bundle — as a plain
  # source_file the shader compiles but is left behind in the pod's own
  # intermediate build directory (never reaches the app bundle); as a plain
  # `resources` entry CocoaPods just copies the raw .metal text uncompiled.
  # resource_bundles is the one path that actually invokes the Metal
  # compiler and copies the resulting .metallib into the app.
  s.resource_bundles = {
    "AnimatedImageLoader" => ["ios/**/*.metal"]
  }

  s.dependency "React-Core"

  install_modules_dependencies(s)
end
