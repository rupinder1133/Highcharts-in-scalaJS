enablePlugins(ScalaJSPlugin)

name := "HighCharts_ScalaJS"

version := "1.0"

scalaVersion := "2.11.7"

//skip in packageJSDependencies := false
//jsDependencies +=
//  "org.webjars" % "jquery" % "2.1.4" / "2.1.4/jquery.js"

libraryDependencies ++= Seq (
  "com.github.karasiq" %%% "scalajs-highcharts" % "1.1.2",
  "org.scala-js" %%% "scalajs-dom" % "0.9.1",
  "be.doeraene" %%% "scalajs-jquery" % "0.9.1"
)
