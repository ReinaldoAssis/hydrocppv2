import React, { MutableRefObject, RefObject, useContext, useRef } from "react";
import { useEffect } from "react";
import p5 from "p5";
import {
  Drawer,
  Group,
  Modal,
  NumberInput,
  ScrollArea,
  Select,
  Stack,
  Switch,
  Text,
  useMantineTheme,
} from "@mantine/core";

import Protein, {
  decompose,
  hydro,
  HydroMatrix,
  nary_tree,
  PROTEIN_DISTRIBUTION,
} from "../processing/Protein";
import { globalState } from "../store/Store";
import { showNotification } from "@mantine/notifications";
import { useDisclosure } from "@mantine/hooks";
import Tree from "./Tree";

const CANVAS_WIDTH = 640;
const CANVAS_HEIGHT = 675;

function Engine(props: {
  vibrant: boolean;
  grid: boolean;
  matrix: HydroMatrix;
  p5ref: any;
  scalar: number;
}) {
  let myp5: any = null;
  let p5ref: any = null;
  let matrix: HydroMatrix;
  matrix = props.matrix;

  const scalar = props.scalar;

  let offset = 30; //offset from (0,0)
  let space = 15; //space between points //past: 5

  let radius: number = 10 * scalar;

  let point_radius: number = radius / 3;

  let grid = props.grid;
  p5ref = props.p5ref; //React.createRef()

  useEffect(() => {
    if (document.getElementsByClassName("p5Canvas").length == 1)
      document.getElementsByClassName("p5Canvas")[0].remove();

    //       // test if already initialized
    if (
      myp5 == null &&
      p5ref.current != null &&
      document.getElementsByClassName("p5Canvas").length == 0
    ) {
      myp5 = new p5(Sketch, p5ref.current) as any;
    }

    //     console.log(this.sequence);
  }, [props.matrix, props.vibrant, props.grid]);

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

      function drawPoint(x: number, y: number, radius: number) {
        sketch.fill(180, 180, 180);
        sketch.noStroke();
        sketch.ellipse(x, y, radius, radius);
      }

      //iterates through the matrix drawing each element
      for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[i].length; j++) {
          //draw grid if enabled
          if (grid)
            drawPoint(
              i * (radius + space) + offset,
              j * (radius + space) + offset,
              point_radius
            );

          if (matrix[i][j].tipo.toLowerCase() == "h")
            drawH(
              i * (radius + space) + offset, //TODO: estranho estar usando i no lugar de x quando j era para estar em seu lugar
              j * (radius + space) + offset, //porem, esta funcionando
              radius
            );
          else if (matrix[i][j].tipo.toLowerCase() == "p")
            drawP(
              i * (radius + space) + offset,
              j * (radius + space) + offset,
              radius
            );
        }
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
  const [vibrant, setVibrant] = React.useState(false);
  const [grid, setGrid] = React.useState(false);
  const [behavior, setBehavior] = React.useState("Path");
  const [scale, setScale] = React.useState(2.5);
  const [opened, setOpened] = React.useState(false);
  //const [tree, setTree] = React.useState<nary_tree>(new nary_tree("x"));

  const [openedModal, { close, open }] = useDisclosure(false);

  const rf = React.useRef();
  const theme = useMantineTheme();

  function exampleSim(s: string) {
    setSeq(s);
    console.log("EXAMPLE SIM");
  }

  function randomSim() {
    console.log("random");
    let s = "";
    if (globalState.rndSize == undefined) globalState.rndSize = 10;
    for (let i = 0; i < globalState.rndSize; i++) {
      let rnd = Math.random();
      if (rnd < 0.5) s += "H";
      else s += "P";
    }
    setSeq(s);
  }

  function showTree() {
    let root: nary_tree = new nary_tree(seq[0]);
    root.make(root, seq, 0);
    console.log(root);
    //setTree(root);
    open();
  }

  globalState.example_sim = exampleSim;
  globalState.random_sim = randomSim;
  globalState.show_tree = showTree;
  globalState.show_sequence = () => {
    setOpened(!opened);
  };
  useEffect(() => {}, [seq, behavior]);

  let size = decompose(seq.length);

  function forceUpdate() {
    let aux = globalState.text_file ?? props.sequence;

    //setSeq("");
    setSeq(aux);
  }

  function logger(err: string) {
    console.log(err);
  }

  //TODO: add custom size
  let protein: Protein = new Protein(
    size.height,
    size.width,
    logger,
    seq,
    behavior == "Path"
      ? PROTEIN_DISTRIBUTION.PATH
      : PROTEIN_DISTRIBUTION.SEQUENTIAL
  );

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
          <Engine
            matrix={protein.protein_matrix}
            vibrant={vibrant}
            p5ref={rf}
            grid={grid}
            scalar={scale}
          />
        </div>
        <div
          style={{
            width: "90%",
            paddingLeft: 15,
            paddingRight: 15,
            paddingTop: 20,
          }}
        >
          <Stack>
            <button
              type="button"
              onClick={() => forceUpdate()}
              style={{ marginBottom: 10 }}
            >
              Run
            </button>
            <button
              type="button"
              onClick={() => {
                globalState.text_file = undefined;
                setSeq("");
              }}
              style={{ marginBottom: 10 }}
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => {
                setOpened(!opened);
              }}
              style={{ marginBottom: 10 }}
            >
              Sequence
            </button>
            {/* <button
              type="button"
              onClick={() => {
                protein.maximize(seq);
              }}
              style={{ marginBottom: 10 }}
            >
              Maximize
            </button> */}
            <Switch
              label="Vibrant"
              size="md"
              checked={vibrant}
              onChange={(event) => setVibrant(event.currentTarget.checked)}
            />
            <Switch
              label="Grid"
              size="md"
              checked={grid}
              onChange={(event) => setGrid(event.currentTarget.checked)}
            />
            <Select
              data={["Sequential", "Path"]}
              label="Behavior"
              onChange={(txt) => setBehavior(txt ?? "")}
              placeholder="Path"
              defaultValue="Path"
            ></Select>

            <NumberInput
              defaultValue={2.6}
              placeholder="1.5"
              label="Scale"
              variant="filled"
              radius="xs"
              size="md"
              step={0.1}
              precision={2}
              onChange={(value) => setScale(value ?? 1.5)}
            />

            <NumberInput
              defaultValue={10}
              placeholder="10"
              label="Rnd Size"
              variant="filled"
              radius="xs"
              size="md"
              step={1}
              onChange={(value) => (globalState.rndSize = value ?? 10)}
            />

            <Text size="xl">
              Score{" "}
              {Math.round((protein.process_score() + Number.EPSILON) * 100) /
                100}{" "}
            </Text>
            <Text size="xl">Size {seq.length}</Text>
          </Stack>
        </div>
      </div>
      <Drawer
        overlayColor={theme.colors.dark[9]}
        overlayOpacity={0.55}
        overlayBlur={0.5}
        size="xs"
        title=""
        opened={opened}
        position="bottom"
        onClose={() => setOpened(false)}
      >
        <ScrollArea style={{ height: 100 }} type="always">
          <Group style={{ marginLeft: 20 }}>
            {seq.split("").map((x) => {
              let h = x.toLowerCase() == "h";
              return (
                <Text
                  className={h ? "blueSeq" : "redSeq"}
                  size="xl"
                  color={h ? "blue" : "red"}
                >
                  {x.toUpperCase()}
                </Text>
              );
            })}
          </Group>
        </ScrollArea>
      </Drawer>

      <Modal
        opened={openedModal}
        onClose={close}
        centered
        withCloseButton={false}
      >
        <Tree tree={protein.path} showTitle={true} />
      </Modal>
    </>
  );
}
