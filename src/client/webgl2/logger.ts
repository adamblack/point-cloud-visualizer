export class Logger {

    private static allowDebug = false

    public static log(msg: String) {
        if (this.allowDebug) {
            console.log(msg)
        }
    }
}