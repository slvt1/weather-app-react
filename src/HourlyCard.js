import React from 'react';
import './HourlyCard.css';
import { Group } from '@vx/group';
import { GlyphDot } from '@vx/glyph';
import { LinePath } from '@vx/shape';
import { scaleTime, scaleLinear } from '@vx/scale';
import { curveMonotoneX, curveBasis } from '@vx/curve';
import { AxisLeft, AxisBottom } from '@vx/axis';

import thermometer_bw_icon from './img/thermometer-bw.svg';
import thermometer_icon from './img/thermometer.svg';
import wind_bw_icon from './img/wind-bw.svg';
import wind_icon from './img/wind.svg';
import pressure_bw_icon from './img/pressure-bw.svg';
import pressure_icon from './img/pressure.svg';


const city_link = "https://api.openweathermap.org/data/2.5/forecast?id=465543&APPID=04d61ef19932cd9a18fc9ae6e026f150";

class HourlyCard extends React.Component{
    constructor(props){
        super(props);
        this.state = {temp: [], dt: [], selected_card: 'Temperature'};
        this.data = {Temperature: [], Pressure: [], Wind: []};
        fetch(city_link)
            .then(res => res.json())
            .then(res => {
                console.log(res);
                let dt = [];
                for(let i=0; i<res.list.length; i++){
                    let date = new Date(res.list[i]['dt']*1000);
                    if(date.toString().slice(0, 3) == this.props.id){
                        this.data["Temperature"].push(Math.round(res.list[i]['main']['temp'] - 273.15));
                        this.data["Pressure"].push(Math.round(res.list[i]['main']['pressure']));
                        this.data['Wind'].push(Math.round(res.list[i]['wind']['speed']));
                        dt.push(date);
                    }
                }
                this.setState({temp: this.data["Temperature"], dt: dt});
            });
    }
    change_style = (name) => {
        this.setState({selected_card: name});
        this.setState({temp: this.data[name]});
    };

    render(){
        return(
            <div className="hourly-card">
                <div className="btns">
                    <HvrButton icon={thermometer_icon} icon_bw={thermometer_bw_icon} name="Temperature" onclick={this.change_style.bind(this, 'Temperature')} 
                        is_selected={this.state.selected_card}></HvrButton>
                    <HvrButton icon={pressure_icon} icon_bw={pressure_bw_icon} name="Pressure" onclick={this.change_style.bind(this, 'Pressure')} 
                        is_selected={this.state.selected_card}></HvrButton>
                    <HvrButton icon={wind_icon} icon_bw={wind_bw_icon} name="Wind" onclick={this.change_style.bind(this, 'Wind')} 
                        is_selected={this.state.selected_card}>></HvrButton>
                </div>
                <Graph dt={this.state.dt} temp={this.state.temp}></Graph> 
            </div>
        );
    }
}

class HvrButton extends React.Component{
    constructor(props){
        super(props);
        this.state = {hovered: false};
    }

    render(){
        let defstyle = "hour-btn";
        if(this.props.is_selected== this.props.name){
            defstyle += ' selected-card';
        }
        return(
            <div onMouseEnter={()=>this.setState({hovered:true})}
                                onMouseLeave={()=>this.setState({hovered: false})}
                                className={this.state.hovered? defstyle+" hovered-card":defstyle}
                                onClick={this.props.onclick}>
                <img src={this.state.hovered?this.props.icon:this.props.icon_bw} className="hour-img"></img>
                <p className='hour-text'>{this.props.name}</p>
            </div>

        );
    }
}

class Graph extends React.Component{
    constructor(props){
        super(props);
    }

    render(){
        const bdata = this.props.dt.reverse();
        const adata = this.props.temp.reverse();
        let data = [];
        for (let i =0; i<adata.length; i++){
            data.push({date: bdata[i], value: adata[i]});
        }

        // accessors
        const date = d => d.date;
        const value = d => d.value;

        // scales
        const xScale = scaleTime({
        domain: [Math.min(...data.map(date)), Math.max(...data.map(date))]
        });
        const yScale = scaleLinear({
        domain: [Math.min(...data.map(value)), Math.max(...data.map(value))]
        });

        // positions
        const x = d => xScale(date(d));
        const y = d => yScale(value(d));

        // colors
        const primary = '#8921e0';
        const secondary = '#00f2ff';
        const contrast = '#ffffff';
        let width = 612;
        let height = 512; 
        let margin = 20;
        const xMax = height-margin*2;
        const yMax = xMax;

        // update scale range to match bounds
        xScale.range([20, xMax]);
        yScale.range([yMax, 20]);

        return(
        <div className="graph-area">
            <svg width={width} height={height}>
                <rect x={0} y={0} width={width} height={height} fill={secondary} rx={14} />
                <Group top={margin.top} transform="translate(60, 0)">
                    <LinePath
                    data={data}
                    x={x}
                    y={y}
                    stroke={primary}
                    strokeWidth={2}
                    strokeDasharray="2,2"
                    curve={curveBasis}
                    />
                    <LinePath
                    data={data}
                    x={x}
                    y={y}
                    stroke={primary}
                    strokeWidth={3}
                    curve={curveMonotoneX}
                    />
                    <AxisBottom top={yMax} scale={xScale} numTicks={width > 520 ? 10 : 5} />
                    <AxisLeft scale={yScale} />
                    {data.map((d, i) => {
                    const cx = x(d);
                    const cy = y(d);
                    return (
                        <g key={`line-point-${i}`}>
                        <GlyphDot cx={cx} cy={cy} r={6} fill={contrast} stroke={secondary} strokeWidth={10} />
                        <GlyphDot cx={cx} cy={cy} r={6} fill={secondary} stroke={primary} strokeWidth={3} />
                        <GlyphDot cx={cx} cy={cy} r={4} fill={contrast} />
                        </g>
                    );
                    })}
                </Group>
            </svg>
        </div>
        );
    }
}

export default HourlyCard;