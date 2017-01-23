/**
  * Created by rupindersingh on 1/20/17.
  */

import scalajs.js
import js.JSApp
import org.scalajs.jquery.jQuery
import com.highcharts.HighchartsUtils._
import com.highcharts.HighchartsAliases._
import com.highcharts.config._
import scala.util.Random

object lineChart extends JSApp{
  def main(): Unit ={
    var randomGenerator = Random

    val config = new HighchartsConfig {
      // Chart config
      override val chart: Cfg[Chart] = Chart(`type` = "line")
      // Chart title
      override val title: Cfg[Title] = Title(text = "Demo chart")
      // Y Axis settings
      override val yAxis: Cfg[YAxis] = YAxis(title = YAxisTitle(text = "Values"))
      // Series
      override val series: SeriesCfg = js.Array[AnySeries](
        SeriesLine(name = "Test Series",
          data= js.defined(js.Array(
            js.Array[js.Any]( 0,randomGenerator.nextInt(100) ),
            js.Array[js.Any]( 1,randomGenerator.nextInt(100) ),
            js.Array[js.Any]( 2,randomGenerator.nextInt(100) ),
            js.Array[js.Any]( 3,randomGenerator.nextInt(100) ),
            js.Array[js.Any]( 4,randomGenerator.nextInt(100) ),
            js.Array[js.Any]( 5,randomGenerator.nextInt(100) ),
            js.Array[js.Any]( 6,randomGenerator.nextInt(100) ),
            js.Array[js.Any]( 7,randomGenerator.nextInt(100) ),
            js.Array[js.Any]( 8,randomGenerator.nextInt(100) ),
            js.Array[js.Any]( 9,randomGenerator.nextInt(100) ),
            js.Array[js.Any]( 10,randomGenerator.nextInt(100) )
          )),
          animation = true
        )
      )
    }

    jQuery("#container").highcharts(config)

  }
}
