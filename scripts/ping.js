function ping(ctx){
    ctx.fillRect(0, 0, 1, 1);
    window.requestAnimationFrame(()=>{ping(ctx)})
}
function setupPing(canvas){
    if (canvas.getContext) {
        var ctx = canvas.getContext('2d');
        window.requestAnimationFrame(()=>{ping(ctx)})
    }
}
