import React, { MutableRefObject, RefObject, useRef } from "react";
import { useEffect } from "react";
import p5 from "p5";
import { Switch } from "@mantine/core";

// const s = (sketch: any) => {
//   let x = 100;
//   let y = 100;

//   sketch.setup = () => {
//     sketch.createCanvas(200, 200);
//   };

//   sketch.draw = () => {
//     sketch.background(0);
//     sketch.fill(255);
//     sketch.rect(x, y, 50, 50);
//   };
// };

// let myp5 = new p5(s);

const CANVAS_WIDTH = 640;
const CANVAS_HEIGHT = 675;

// class Engine extends React.Component<{ vibrant: boolean; sequence: string }> {
//   myp5: any = null;
//   p5ref: any = null;

//   radius: number = 30;
//   sequence: string = "";

//   constructor(props: any) {
//     super(props);
//     this.p5ref = React.createRef();
//     this.sequence = props.sequence;
//   }

//   Sketch = (sketch: any) => {
//     sketch.setup = () => {
//       sketch.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
//     };

//     sketch.draw = () => {
//       sketch.background(40, 40, 40);
//       let vibrant = this.props.vibrant;

//       function drawH(x: number, y: number, radius: number) {
//         if (vibrant) sketch.fill(53, 106, 255);
//         else sketch.fill(90, 90, 90);

//         sketch.noStroke();
//         sketch.ellipse(x, y, radius, radius);
//       }

//       function drawP(x: number, y: number, radius: number) {
//         if (vibrant) sketch.fill(255, 43, 64);
//         else sketch.fill(200, 200, 200);

//         sketch.noStroke();
//         sketch.ellipse(x, y, radius, radius);
//       }

//       let x = 100;
//       let y = 100;
//       for (var i = 0; i < this.sequence.length; i++) {
//         if (this.sequence[i].toLowerCase() == "h") {
//           drawH(50 + x, 50, this.radius);
//         } else if (this.sequence[i].toLowerCase() == "p") {
//           drawP(100 + x, 100, this.radius);
//         }
//         x += 2 * this.radius;
//       }
//       //console.log(this.sequence);
//       //   drawH(50, 50, this.radius);
//       //   drawP(100, 50, this.radius);
//     };
//   };

//   componentDidMount() {
//     if (this.myp5 == null)
//       // test if already initialized
//       this.myp5 = new p5(this.Sketch, this.p5ref.current) as any;

//     console.log(this.sequence);
//   }

//   render() {
//     //console.log("render");
//     return <div ref={this.p5ref}></div>;
//   }
// }

function Engine(props: { vibrant: boolean; sequence: string; p5ref: any }) {
  let myp5: any = null;
  let p5ref: any = null;

  let radius: number = 30;
  let sequence: string = "";

  p5ref = props.p5ref; //React.createRef()
  sequence = props.sequence;

  useEffect(() => {
    if (document.getElementsByClassName("p5Canvas").length == 1)
      document.getElementsByClassName("p5Canvas")[0].remove();

    if (
      myp5 == null &&
      p5ref.current != null &&
      document.getElementsByClassName("p5Canvas").length == 0
    )
      //       // test if already initialized
      myp5 = new p5(Sketch, p5ref.current) as any;

    //     console.log(this.sequence);
  }, [props.sequence]);

  let Sketch = (sketch: any) => {
    sketch.setup = () => {
      var canv = sketch.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
      canv.parent("canvas");
    };

    sketch.draw = () => {
      sketch.background(40, 40, 40);
      let vibrant = props.vibrant;

      function drawH(x: number, y: number, radius: number) {
        if (vibrant) sketch.fill(53, 106, 255);
        else sketch.fill(90, 90, 90);

        sketch.noStroke();
        sketch.ellipse(x, y, radius, radius);
      }

      function drawP(x: number, y: number, radius: number) {
        if (vibrant) sketch.fill(255, 43, 64);
        else sketch.fill(200, 200, 200);

        sketch.noStroke();
        sketch.ellipse(x, y, radius, radius);
      }

      let x = 100;
      let y = 100;
      for (var i = 0; i < sequence.length; i++) {
        if (sequence[i].toLowerCase() == "h") {
          drawH(50 + x, 50, radius);
        } else if (sequence[i].toLowerCase() == "p") {
          drawP(100 + x, 100, radius);
        }
        x += 2 * radius;
      }
    };
  };

  return <></>;
  //   return <div ref={p5ref}></div>;
}

interface SimulationProps {
  sequence: string;
}

export default function Simulation2D(props: SimulationProps) {
  const [seq, setSeq] = React.useState(props.sequence);

  const rf = React.useRef();

  useEffect(() => {
    console.log("use effect force: " + seq);
  }, [seq]);

  function forceUpdate() {
    setSeq(props.sequence);
    console.log("force update");
  }

  return (
    <>
      <div className="row">
        <div
          style={{
            width: "80vw",
            height: "90vh",
            backgroundColor: "rgb(40,40,40)",
          }}
          id="canvas"
          ref={rf as unknown as RefObject<HTMLDivElement>}
        >
          <Engine sequence={seq} vibrant={false} p5ref={rf} />
        </div>
        <div style={{ width: "90%", paddingLeft: 20, paddingTop: 20 }}>
          <button
            type="button"
            onClick={() => forceUpdate()}
            style={{ marginBottom: 10 }}
          >
            Run
          </button>
          <Switch label="Vibrant" size="md" />
        </div>
      </div>
    </>
  );
}
