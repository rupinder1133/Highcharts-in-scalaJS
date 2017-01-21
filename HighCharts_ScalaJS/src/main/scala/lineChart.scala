/**
  * Created by rupindersingh on 1/20/17.
  */

import scalajs.js
import js.JSApp
import org.scalajs.jquery.jQuery
import com.highcharts.HighchartsUtils._
import com.highcharts.HighchartsAliases._
import com.highcharts.config._

object lineChart extends JSApp{
  def main(): Unit ={
    var config = new HighchartsConfig {
      // Chart config
      override val chart: Cfg[Chart] = Chart(`type` = "line")
      // Chart title
      override val title: Cfg[Title] = Title(text = "Demo chart")

      // X Axis settings
      override val xAxis: Cfg[XAxis] = XAxis(categories = js.Array("1","2","3","4","5","6","7"))

      // Y Axis settings
      override val yAxis: Cfg[YAxis] = YAxis(title = YAxisTitle(text = "Values"))

      // Series
      override val series: SeriesCfg = js.Array[AnySeries](
        SeriesLine(name = "Test Series",
                    data = js.Array(1,2,3,7,2,9,3),
                    animation = true
                  )
      )
    }

    jQuery("#container").highcharts(config)

  }
}
