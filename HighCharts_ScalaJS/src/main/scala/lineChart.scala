/**
  * Created by rupindersingh on 1/20/17.
  */

import org.scalajs.dom
import dom.document

import scala.scalajs.js.annotation.JSExport
import scalajs.js
import js.{JSApp, UndefOr}
import org.scalajs.jquery.jQuery
import com.highcharts.HighchartsUtils._
import com.highcharts.HighchartsAliases._
import com.highcharts.config._

import scala.collection.mutable
import js.JSConverters._

object lineChart extends JSApp{
  def main(): Unit ={
    var config = new HighchartsConfig {
      // Chart config
      override val chart: Cfg[Chart] = Chart(`type` = "line")
      // Chart title
      override val title: Cfg[Title] = Title(text = "Demo chart")

      // X Axis settings
//      override val xAxis: Cfg[XAxis] = XAxis(categories = js.Array("1","2","3","4","5","6","7"))

      // Y Axis settings
      override val yAxis: Cfg[YAxis] = YAxis(title = YAxisTitle(text = "Values"))

      // Series
      override val series: SeriesCfg = js.Array[AnySeries](
        SeriesLine(name = "Test Series",
                    data = js.Array(
                      js.Array(0, 1),
                      js.Array(1, 2),
                      js.Array(2, 8)
                    ),
                    animation = true
                  )
      )
    }

    jQuery("#container").highcharts(config)
//    var ss:js.Array[js.UndefOr[Double]]= js.Array[js.UndefOr[Double]](js.Array[Double](1,2))
//    dom.console.log( ss )
  }
}
