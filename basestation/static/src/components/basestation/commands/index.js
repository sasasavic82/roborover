import Backward from "./Backward";
import Drive from "./Drive";
import Forward from "./Forward";
import Left from "./Left";
import Pan from "./Pan";
import Photo from "./Photo";
import Right from "./Right";
import Stop from "./Stop";
import Tilt from "./Tilt";

const components = {
    "pan": Pan,
    "tilt": Tilt,
    "stop": Stop,
    "right": Right,
    "left": Left,
    "forward": Forward,
    "backward": Backward,
    "drive_cm": Drive,
    "image": Photo
}

const componentSelection = [{
    value: "pan",
    label: "Pan"
}, {
    value: "tilt",
    label: "Tilt"
}, {
    value: "forward",
    label: "Forward"
}, {
    value: "backward",
    label: "Backward"
}, {
    value: "left",
    label: "Left"
}, {
    value: "right",
    label: "Right"
}, {
    value: "stop",
    label: "Stop"
}, {
    value: "drive_cm",
    label: "Drive"
},{
    value: "image",
    label: "Photo"
}];

export {
    Pan,
    Tilt,
    Stop,
    Right,
    Left,
    Forward,
    Backward,
    Drive,
    Photo,
    components,
    componentSelection
}