# Vynth
Use it [here](https://jdillonh.github.io/Vynth/).  

<img src="https://github.com/jdillonh/Vynth/blob/master/examples/collage2.jpg">  

## What is it?

Vynth is a modular digital video synthesizer, inspired by analog video synthesizers 
(like [this](https://www.youtube.com/watch?v=5a7Lw08Ps6U)), 
that runs in your browser.

With Vynth, users make programs or "patches" out of simple building blocks. Those patches compile
into GLSL fragment shaders that run via WebGL.

It presents an interface that will be familiar to users of Max/MSP/Jitter or other visual programming 
environments, and is an easy way to play with graphics programs without having to 
type them out by hand. 


## Instructions
### Modules
Modules are the building blocks of every program. Click the boxes around the sides of the screen to create modules.
Click and drag modules to move them around.
"Patch" them together by clicking on the outlet of one module (the grey circle on its right side) and then the inlet of 
another module (one of the circles on its left side).
After creating a patch click the reload button (**REL**) to compile and run your program.

Patches generally look like this *inputs* -> *transformations* -> *output*.

You can right click while hovering over a module or a patch cable to **delete** it.

### Inputs
The first type of module is an *input*.
These modules have no inlets. There are three kinds:  
<img src="https://github.com/jdillonh/Vynth/blob/master/examples/xyt.png" height="60px">  
**x** which corresponds to a pixels x position  
**y** which corresponds to a pixels y position  
and **t** which is a value that steadily increases with time.  

### Transformations 
The inputs can be transformed to make different patterns using
transformation modules.

The **sin**, **tri**, **saw** and **sqr** transformations are oscillators and will change
inputs into repeating patterns as shown below:  
![waveshapes](https://github.com/jdillonh/Vynth/blob/master/examples/waveshapes.png)  
These module have 2 inputs, the first input is the value that will be transformed, the second is the 
*chromatic offset*. As this number increases the difference in phase of the output across color channels will increase.
This creates an effect similar to chromatic aberration.

The **theta** and **rad** (radius) modules allow you to create patterns with cartesian 
symmetry. They work by converting radial coordinates into polar coordinates. Here are examples of one way to wire them up:  
(click the image to see it larger)  
<img src="https://github.com/jdillonh/Vynth/blob/master/examples/radExample.png" width="400">
<img src="https://github.com/jdillonh/Vynth/blob/master/examples/thetaExample.png" width="400">

<img src="https://github.com/jdillonh/Vynth/blob/master/examples/numberbox.png" width="50">  

The **Number Box** module
has 1 input and 1 output. The number the module represents can be changed by clicking inside the box and typing in a new number.
If another module is connected to input of this module then the output will be the input * the number,
otherwise the just number will be output.  
This is useful for scaling an input. For example, if you want to adjust the rate of *t*,
simply route it through a number box.

You do not need to click reload (*REL*) after every change to the number box, it will update automatically.

<img src="https://github.com/jdillonh/Vynth/blob/master/examples/midi.png" width="50">  

The **MIDI** module works similarly to the number box, but its value is controlled by a CC midi controller.
To use this module, add it to your patch and set the number in its UI to the MIDI CC#. The MIDI module listens on every channel 
and will output 1 for MIDI 127 and 0 for MIDI 0.
Make sure your midi controller is plugged in before starting Vynth.

<img src="https://github.com/jdillonh/Vynth/blob/master/examples/multiply.png" width="50">  

The **Multiply** Module takes two inputs and simply multiplies them. 

### Output
The **&Omega;** (output) module represents the end of the patch. Its three inputs correspond to the three color channels
Red, Green and Blue. *There must be exactly one &Omega; module.* If nothing is connected to the &Omega; module, or 
there is not exactly one of them, the patch will not compile.

### Other Controls
New in V2 is the *REC* button. You can now create gif or png recordings of your patches! 

The **X** button in the top-left will toggle hiding / showing the ui so you can see your patches in all their glory.

## Examples & Techniques
Tiling Patterns:  
![tiling](https://github.com/jdillonh/Vynth/blob/master/examples/tiling-example.png)
Saw waves are useful for creating patterns that tile or repeat. Here we 'repeat' the x axis and y axis several
times by passing them into the saw oscillator. You can use the output of these saw's to make more complex patterns.

Lines:  
![squiggles](https://github.com/jdillonh/Vynth/blob/master/examples/squigly-lines.png)  
x -> sqr makes vertical stripes. Add a little bit of y -> sin to make them squiggly.

![plaid](https://github.com/jdillonh/Vynth/blob/master/examples/simple-plaid.png)  
sqr demonstrates combining stripes to make a plaid look.

Kaliedascope patterns:  
![kaleida](https://github.com/jdillonh/Vynth/blob/master/examples/kaleidescope.png)  
theta and rad process x & y to give angle and radius (polar coordinates).
angle goes into saw to create a repeating pattern along the theta axis.
sqr makes that data into stripes.
chromatic offset over time makes the rainbow.

![circtile](https://github.com/jdillonh/Vynth/blob/master/examples/tile-circles.png)  
Combine polar coordinates and tiling to create tiled circles.

### Old Examples
These are from the last version of Vynth. They should still work but might look a little different now.  
![screenshot1](https://github.com/jdillonh/Vynth/blob/master/examples/screenshot1.png)
![screenshot2](https://github.com/jdillonh/Vynth/blob/master/examples/screenshot2.png)
![screenshot3](https://github.com/jdillonh/Vynth/blob/master/examples/screenshot3.png)
![screenshot4](https://github.com/jdillonh/Vynth/blob/master/examples/screenshot4.png)

![collage](https://github.com/jdillonh/Vynth/blob/master/examples/collage.jpg)

