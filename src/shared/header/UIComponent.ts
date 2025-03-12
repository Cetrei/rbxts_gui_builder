import { any } from "@rbxts/knit/Knit/Util/Promise";
import Roact, { JsxInstance } from "@rbxts/roact";
import { JsxNode } from "@rbxts/roact/src/jsx";
import Signal from "@rbxutil/signal";

export enum UIStateType {
    IDLE = 'IDLE',
    HOVER = 'HOVER',
    ACTIVE = 'ACTIVE',
    DISABLED = 'DISABLED',
    FOCUS = 'FOCUS',
    SELECTED = 'SELECTED',
}

export interface UIState {
    Properties: Map<string, Map<string, unknown>>;
    TweenInfo: TweenInfo;
}

export interface UIConfig {
    readonly DebugMode: boolean;
    readonly Colors: Map<string, Color3>;
}

export interface UIData {
    readonly Name: string;
    readonly Instance: GuiObject | undefined;
}

export type UIInstanceData = GuiObject | {Name: string, Parent: Instance, Tree: Roact.Element}

export abstract class UIComponent implements UIData, UIConfig {
    public Instance: GuiObject | undefined
    public Name: string
    public DebugMode: boolean
    public Colors: Map<string, Color3>
    public onStateChanged: Signal<unknown>

    private CurrentState: UIStateType = UIStateType.IDLE
    protected States: Map<UIStateType, UIState> = new Map()
    protected Targets: Map<string, Instance> = new Map()

    constructor(
        instanceData: UIInstanceData,
        name?: string,
        debugMode?: boolean,
        colors?: Map<string, Color3>
    ) {
        if (typeIs(instanceData, "Instance") && instanceData.IsA("GuiObject")) {
            this.Instance = instanceData
        } else if (identity<UIInstanceData>(instanceData)) {
            Roact.mount(instanceData.Tree, instanceData.Parent, instanceData.Name)
            this.Instance = instanceData.Parent.WaitForChild(instanceData.Name) as GuiObject
        } else {
            this.Instance = undefined
        }

        this.Name = name || this.Instance?.Name || "unnamed"
        this.DebugMode = debugMode || false
        this.Colors = colors || new Map()



        this.onStateChanged = new Signal()
        this.onStateChanged.Connect((state: UIState) => {
            if (this.DebugMode) {
                print(`State changed to ${state}`)
            }
        })

        if (typeIs(this.Instance, "Instance")) {    
            this.Targets.set(this.Name, this.Instance)
            this.getInstanceTargets()
        }
    }

    private getInstanceTargets() {
        this.Instance?.GetDescendants().forEach((instance) => {
            this.Targets.set(instance.Name, instance)
        })
    }

    public setCurrentState(state: UIStateType): void {
        if (this.CurrentState === state) return

        const stateData = this.States.get(state)
        if (stateData === undefined) {
            throw error(`State ${state} not found in ${this.Name}`)
        }

        this.CurrentState = state

        this.onStateChanged.Fire(state)
    }

    public isInState(state: UIStateType): boolean {
        return this.CurrentState === state
    }

    public addState(stateType: UIStateType, stateData: UIState): void {
        this.States.set(stateType, stateData)
    }

    public forceState(state: UIStateType): void {
        this.CurrentState = state
    }
}