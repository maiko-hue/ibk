package pe.ibk.apkpro.ui.components

import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.composed
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color

fun Modifier.shimmerEffect(enabled: Boolean = true): Modifier = composed {
    if (!enabled) return@composed this

    val transition = rememberInfiniteTransition(label = "shimmerTransition")
    val translateAnim = transition.animateFloat(
        initialValue = 0f,
        targetValue = 1000f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 1200, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "shimmerAnimation"
    )

    val shimmerColors = listOf(
        Color(0xFFE8E8E8),
        Color(0xFFF6F6F6),
        Color(0xFFE8E8E8)
    )

    val brush = Brush.linearGradient(
        colors = shimmerColors,
        start = Offset(x = translateAnim.value - 400f, y = 0f),
        end = Offset(x = translateAnim.value, y = 200f)
    )

    this.background(brush)
}
