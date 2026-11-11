// Adaptateur du matériel : il lit les touches et donne au jeu le temps écoulé.
// Chaque son du mixeur a une fin et une enveloppe douce.
let derniereImageMs = control.millis()
NuitSon.preparer()
controller.menu.onEvent(ControllerButtonEvent.Pressed, function () { Nuit.basculerPause() })
game.onUpdate(function () {
    let instantMs = control.millis()
    let dt = Math.min(50,instantMs-derniereImageMs)
    derniereImageMs = instantMs
    let touches = 0
    if (controller.left.isPressed()) touches |= 1
    if (controller.right.isPressed()) touches |= 2
    if (controller.up.isPressed()) touches |= 4
    if (controller.down.isPressed()) touches |= 8
    if (controller.A.isPressed()) touches |= 16
    if (controller.B.isPressed()) touches |= 32
    Nuit.actualiser(dt,touches)
    NuitSon.actualiser(instantMs)
})
game.onPaint(function () { Nuit.dessiner() })
