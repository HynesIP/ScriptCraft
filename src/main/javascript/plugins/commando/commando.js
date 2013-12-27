/*************************************************************************
# Commando Plugin

## Description

commando is a plugin which can be used to add completely new commands
to Minecraft.  Normally ScriptCraft only allows for provision of new
commands as extensions to the jsp command. For example, to create a
new simple command for use by all players...

    /js command('hi', function(){ echo('Hi ' + self.name); });
  
... then players can use this command by typing...

    /jsp hi

... A couple of ScriptCraft users have asked for the ability to take
this a step further and allow the global command namespace to be
populated so that when a developer creates a new command using the
'command' function, then the command is added to the global command
namespace so that players can use it simply like this...

    /hi

... There are good reasons why ScriptCraft's core `command()` function
does not do this. Polluting the global namespace with commands would
make ScriptCraft a bad citizen in that Plugins should be able to work
together in the same server and - as much as possible - not step on
each others' toes. The CraftBukkit team have very good reasons for
forcing Plugins to declare their commands in the plugin.yml
configuration file. It makes approving plugins easier and ensures that
craftbukkit plugins behave well together. While it is possible to
override other plugins' commands, the CraftBukkit team do not
recommend this. However, as ScriptCraft users have suggested, it
should be at the discretion of server administrators as to when
overriding or adding new commands to the global namespace is good.

So this is where `commando()` comes in. It uses the exact same
signature as the core `command()` function but will also make the
command accessible without the `jsp` prefix so instead of having to
type `/jsp hi` for the above command example, players simply type
`/hi` . This functionality is provided as a plugin rather than as part
of the ScriptCraft core.

## Example hi-command.js

    var commando = require('../commando');
    commando('hi', function(){
       echo('Hi ' + self.name);
    });

...Displays a greeting to any player who issues the `/hi` command.

## Example - timeofday-command.js 

    var times = {Dawn: 0, Midday: 6000, Dusk: 12000, Midnight:18000};
    commando('timeofday', function(params){
           self.location.world.setTime(times[params[0]]);
       },
       ['Dawn','Midday','Dusk','Midnight']);

... changes the time of day using a new `/timeofday` command (options are Dawn, Midday, Dusk, Midnight)

## Caveats

Since commands registered using commando are really just appendages to
the `/jsp` command and are not actually registered globally (it just
looks like that to the player), you won't be able to avail of tab
completion for the command itself or its parameters (unless you go the
traditional route of adding the `jsp` prefix). This plugin uses the
[PlayerCommandPreprocessEvent][pcppevt] which allows plugins to
intercepts all commands and inject their own commands instead. If
anyone reading this knows of a better way to programmatically add new
global commands for a plugin, please let me know.

[pcppevt]: http://jd.bukkit.org/dev/apidocs/org/bukkit/event/player/PlayerCommandPreprocessEvent.html

***/
var commands = {};

exports.commando = function(name, func, options, intercepts){
    var result = command(name, func, options, intercepts);
    commands[name] = result;
    return result;
};

events.on('player.PlayerCommandPreprocessEvent', function(l,e){
    var msg = "" + e.message;
    var command = msg.match(/^\/([^\s]+)/)[1];
    if (commands[command]){
        e.message = "/jsp " + msg.substring(1);
    }
});
events.on('server.ServerCommandEvent', function(l,e){
    var msg = "" + e.command;
    var command = msg.match(/^\/*([^\s]+)/)[1];
    if (commands[command]){
        e.command = "/jsp " + msg.substring(1);
    }
});