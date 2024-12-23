import { useState, Fragment, useRef } from "react";

import { Box, Flex, Title, Slider, Menu, Anchor, Modal, Loader, Image as MantineImage, Text, Button, FileButton, Group, ActionIcon } from "@mantine/core";
import { useViewportSize } from "@mantine/hooks";
import AvatarEditor from 'react-avatar-editor';

const githubRepositoryURL: string = "https://github.com/ray-1337/radial-pfp-cut";

export default function MainPage() {
  const [image, setImage] = useState<File | null>(null);
  const [scale, setScale] = useState<number>(1);
  const editorRef = useRef<AvatarEditor>(null);

  const { width: windowWidth } = useViewportSize();

  // final
  const [modalState, setModalState] = useState<boolean>(false);
  const [finalURL, setFinalURL] = useState<string | null>(null);

  const changeImagePerception = (file: File | null) => {
    setImage(file);
    setScale(1);
    return;
  };

  const generatePreview = (mimeType?: string) => {
    if (!image) {
      return alert("Invalid image.");
    };

    const canvas = document.createElement("canvas");
    if (!canvas) {
      return alert("Invalid canvas ref.");
    };

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return alert("Invalid canvas context.");
    };
    
    const img = new Image();
    const url = URL.createObjectURL(image);
    img.src = url;

    const startCropping = () => {
      let [w, h]: [number, number] = [0, 0];

      // convert the image aspect ratio to a square (1:1)
      // for example, if the image resolution is 1000x1414, then the final result will be 1414x1414 and vice-versa
      if (img.height > img.width) {
        w = canvas.width = img.height;
        h = canvas.height = img.height;
      } else if (img.width > img.height) {
        w = canvas.width = img.width;
        h = canvas.height = img.width;
      } else {
        w = canvas.width = img.width;
        h = canvas.height = img.height;
      };

      const rect = editorRef.current?.getCroppingRect();

      // adapted from multiple sources:
      // https://stackoverflow.com/a/26350058
      // https://github.com/mosch/react-avatar-editor/
      ctx.drawImage(
        img,
        rect ? Math.round(-rect.x * (w / rect.width)) : 0,
        rect ? Math.round(-rect.y * (h / rect.height)) : 0,
        rect ? Math.round(w / rect.width) : w,
        rect ? Math.round(h / rect.height) : h,
      );

      ctx.globalCompositeOperation = "destination-in";
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, h / 2, 0, Math.PI*2);
      ctx.closePath();
      ctx.fill();

      URL.revokeObjectURL(url);

      canvas.toBlob((blob) => {
        if (!blob) {
          return alert("Unable to convert canvas into a blob.");
        };

        const url = URL.createObjectURL(blob);

        setFinalURL(url);
      }, (mimeType || image.type), 1);
    };

    img.onload = startCropping;

    img.onerror = (error) => {
      alert("An unknown error occurred when trying to load the image into the canvas. Check the console log for more information.");

      throw error;
    };

    return setModalState(true);
  };

  const closeModal = () => {
    if (finalURL !== null) {
      URL.revokeObjectURL(finalURL);

      setFinalURL(null);
    };

    return setModalState(false);
  };

  return (
    <Fragment>
      {/* modal */}
      <Modal fullScreen={windowWidth < 500} centered opened={modalState} onClose={closeModal} size={"lg"}>
        <Box style={{width: "100%", height: "100%"}}>
          {
            typeof finalURL === "string" ? (
              <MantineImage src={finalURL} width={"auto"} height={"auto"}/>
            ) : (
              <Flex justify={"center"}>
                <Loader />
              </Flex>
            )
          }
        </Box>

        <Group justify={"flex-end"} mt={"xl"}>
          <Button color={"gray"} onClick={closeModal}>
            Close
          </Button>

          <Button component={"a"} href={finalURL || "#"} disabled={typeof finalURL !== "string"} target={"_blank"} download={String(image?.name || Date.now()).split(".").shift()}>
            Save
          </Button>
        </Group>
      </Modal>

      {/* interface */}
      <Box maw={"640px"} my={0} mx={"auto"} pb={"lg"}>
        <Flex gap={"xl"} direction={"column"} align={"center"} mt={"xl"}>
          {/* trademark */}
          <Flex direction={"column"} align={windowWidth < 500 ? "center" : undefined}>
            <Title order={windowWidth < 500 ? 4 : 2}>Radial Profile Picture Cut</Title>
            
            <Text size={"xs"}>Made by <Anchor href={githubRepositoryURL} target={"_blank"}>ray-1337</Anchor>.</Text>
          </Flex>

          {/* avatar editor */}
          {
            image !== null && (
              <Flex direction={"column"} gap={"md"}>
                {/* avatar preview */}
                <Flex direction={"column"} gap={6}>
                  <AvatarEditor
                    ref={editorRef}
                    image={image}
                    borderRadius={9999}
                    scale={scale}
                    style={{height: windowWidth < 500 ? "224px" : "384px", width: "auto"}}
                    height={windowWidth < 500 ? 224 : 384} width={windowWidth < 500 ? 224 : 384}
                  />

                  <Text size={"10px"} c={"gray"}>
                    * Hover and drag the picture to set the cropping position.
                  </Text>
                </Flex>

                <Flex direction={"column"} gap={"xs"}>
                  <Text size="sm">Zoom</Text>

                  <Slider
                    size={"md"}
                    min={1} max={5}
                    step={0.01}
                    defaultValue={1}
                    onChange={setScale}
                    marks={[{value: 1, label: "100%"}, {value: 5, label: "500%"}]}
                    label={(value) => Math.round(value * 100) + "%"}
                  />
                </Flex>
              </Flex>
            )
          }

          {/* button */}
          <Flex direction={windowWidth < 360 ? "column" : "row"} mt={"lg"} gap={"md"}>
            {/* upload image button */}
            <FileButton onChange={changeImagePerception} accept={["jpeg", "png", "jpg", "webp"].map((ext) => "image/" + ext).join(",")}>
              {(props) => <Button {...props}>Upload</Button>}
            </FileButton>

            <Group gap={0}>
              <Button style={{borderTopRightRadius: 0, borderBottomRightRadius: 0}} disabled={image === null} onClick={() => generatePreview()}>Generate preview</Button>

              <Menu withArrow shadow={"lg"}>
                <Menu.Target>
                  <ActionIcon disabled={image === null} size={36} style={{borderTopLeftRadius: 0, borderBottomLeftRadius: 0, border: 0, borderLeft: `1px solid var(--mantine-color-body)`}}>
                    <Text fw={"bold"}>+</Text>
                  </ActionIcon>
                </Menu.Target>

                <Menu.Dropdown>
                  {
                    ["jpg", "jpeg", "png", "webp"].map((type, index) => (
                      <Menu.Item onClick={() => generatePreview("image/" + type)} key={"generate-menu-item-" + index}>
                        Generate as .{type}

                        {
                          type === "png" && (
                            <Text size={"11px"} c={"gray"}>The background will be transparent.</Text>
                          )
                        }

                        {
                          type === "webp" && (
                            <Text size={"10px"} c={"gray"}>This may affect the quality of the final image.</Text>
                          )
                        }
                      </Menu.Item>
                    ))
                  }
                </Menu.Dropdown>
              </Menu>
            </Group>
          </Flex>

          {/* footer */}
          <Flex px={"xs"} maw={"384px"} direction={"column"} gap={"xs"} style={{width: "100%"}}>
            {
              [
                "Everything is processed through your browser. No third-parties ever involved.",
                "The final image will be served in a 1:1 aspect ratio.",
                "The final image MIME type will match the input image, but you can change it to a different MIME type if you wish.",
                "The final image resolution will depend on the larger dimension (width or height) of the original image. For example, if the original image is 1000x1414, the final image will have a resolution of 1414x1414.",
                "It fits perfect on a social media who doesn't accomodate a pan-n-crop feature such as Instagram."
              ].map((text, index) => (
                <Text key={`footer-index-${index}`} size={"xs"} c={"gray"}>{index + 1}. {text}</Text>
              ))
            }
          </Flex>
        </Flex>
      </Box>
    </Fragment>
  );
};