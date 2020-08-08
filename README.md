# Vynth
Check it out [here](https://jdillonh.github.io/Vynth/).  
![collage](https://github.com/jdillonh/Vynth/blob/master/examples/collage.jpg)
## What is it?
Vynth is a video-synthesizer, inspired by analog video synthesizers 
(like [this](https://www.youtube.com/watch?v=5a7Lw08Ps6U) sorta), 
that runs in your browser.

It presents an interface that will be familiar to users of Max/MSP/Jitter or other visual programming 
environments, and is an easy way to play with graphics programs without having to 
type them out by hand. Similar to [Hydra](https://github.com/ojack/hydra) but designed to be approached
by people who don't have experience coding.

## How do I use it?
Basically you make some blocks, connect them and then press *REL* (Reload)
Every basic patch starts with 3 things: 
A *Driver*, an *Oscillator*, and the *Output Module*.
After creating a patch by connecting these modules,
press the *Reload* (rel) button in the top right corner of the screen.

## Modules
Modules are little boxes that represent an input, function or transformation. To add one to your patch 
click it's cooresponding box on the left or top panels. To remove a module right click it.
Making patches in Vynth means connecting 

### Patching
Connecting modules (or patching) is the main interaction of Vynth.
To create a connection, simply click on an outlet, and then on an inlet. 
If you click on an outlet and then decide that you don't want to create a connection, 
simply click in empty space and the pending connection is canceled.
You can also create connection backwards, by first clicking on an inlet, and then an outlet.

You can delete a connection by right clicking a cable.

### Drivers
There are 3 types of drivers.
The X driver
<img src="https://github.com/jdillonh/Vynth/blob/master/examples/xdriver.png" width="50px" height="50px">
Y driver
<img src="https://github.com/jdillonh/Vynth/blob/master/examples/ydriver.png" width="50px" height="50px">
and Time driver
<img src="https://github.com/jdillonh/Vynth/blob/master/examples/timedriver.png" width="50px" height="50px">.

Drivers *drive* oscillators, that is, they tell them what dimension to work in.
X and Y drivers tell the oscillators to set pixels along the X and Y axis respectively, whereas 
the Time driver sets every pixel according to the change of time.

### Oscillators
There are four types of oscillators: Sine (sin), Triangle (tri), Sawtooth (saw), and Square (sqr).
Anyone familiar with audio synthesis is probably aware of what these look like, but here's a graphic 
for everyone else:
![waveshapes](https://github.com/jdillonh/Vynth/blob/master/examples/waveshapes.png)

Each Oscillator has 2 inputs. The first input is for the driver, the second input controls 
"chromatic offset". This determines how out of phase the oscillator is across its three color channels.
You can connect another driver here, or a uniform (more on those later).

### Output
The output module, (or Omega), is the always the last module in the patch. The three inputs 
correspond to the Red, Green and Blue color channels.
There must be exactly one output module or the program will not compile.

### Multiplication and Uniforms
These two modules go together very well so I will cover them as one topic.
The Multiplier module, (*\**) simply multiplies the two incoming signals. The Number Box 
(a type of uniform) simply stores a number. You can click it and enter any number you want, positive 
or negative.
The most obvious use for theme is to scale drivers. Consider this patch:  
<img src="https://github.com/jdillonh/Vynth/blob/master/examples/driverscaling1.png" width="300px" height="102px">  
It creates 2 bands of color on the screen. Maybe you want 4 of them. 
Simply insert a multiplier and a number box of 2.0 into the patch to scale the X driver. Like this:  
<img src="https://github.com/jdillonh/Vynth/blob/master/examples/driverscaling2.png" width="300px" height="118px">  

## Recording
Recording your patch is now supported! Click the rec box.

## How does it work?
Vynth patches compile into glsl fragment shaders which are laid over a square geometry.
Each module represents a glsl function, uniform value, or other abstraction. 
The compiled shaders are usually pretty simple, you can check them out in the console.

## Examples
Note that things are subject to change, so reproducing these patches exactly 
may produce different results.
![screenshot1](https://github.com/jdillonh/Vynth/blob/master/examples/screenshot1.png)
![screenshot2](https://github.com/jdillonh/Vynth/blob/master/examples/screenshot2.png)
![screenshot3](https://github.com/jdillonh/Vynth/blob/master/examples/screenshot3.png)
![screenshot4](https://github.com/jdillonh/Vynth/blob/master/examples/screenshot4.png)


