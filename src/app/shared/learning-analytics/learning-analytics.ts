import { Component, ElementRef, ViewChild, signal, effect, computed, OnDestroy, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { LmsState } from '../../state';
import * as d3 from 'd3';

type ChartDataPoint = {
  label: string;
} & Record<string, string | number>;

interface TooltipValue {
  courseId: string;
  title: string;
  progress: number;
  color: string;
}

interface TooltipData {
  label: string;
  values: TooltipValue[];
}

@Component({
  selector: 'app-learning-analytics',
  imports: [CommonModule, MatIconModule],
  template: `
    <div id="learning-analytics-widget" class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 shadow-sm space-y-6 transition-all">
      
      <!-- Widget Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div class="flex items-center gap-2">
            <span class="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500">
              <mat-icon class="text-lg">trending_up</mat-icon>
            </span>
            <h3 class="font-bold text-lg text-slate-800 dark:text-slate-200">Learning Analytics</h3>
          </div>
          <p class="text-xs text-slate-500 mt-1">Milestone progression & velocity across multiple syllabus tracks over time</p>
        </div>
        
        <!-- Controls -->
        <div class="flex items-center gap-2 self-start sm:self-auto">
          <!-- Style Toggle -->
          <button 
            (click)="toggleChartStyle()"
            class="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors flex items-center justify-center cursor-pointer"
            title="Toggle Chart Style (Line / Area)"
          >
            <mat-icon class="text-sm">{{ chartStyle() === 'area' ? 'show_chart' : 'area_chart' }}</mat-icon>
          </button>
          
          <!-- Timeframe Selector -->
          <div class="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/20">
            @for (tf of timeframes; track tf.id) {
              <button 
                (click)="selectedTimeframe.set(tf.id)"
                [class]="'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border-none ' + 
                         (selectedTimeframe() === tf.id ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-cyan-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300')"
              >
                {{ tf.name }}
              </button>
            }
          </div>
        </div>
      </div>

      <!-- Legend & Toggle Pills -->
      <div class="flex flex-wrap gap-2">
        @for (c of chartCourses(); track c.id) {
          <button 
            (click)="toggleCourseActive(c.id)"
            [class]="'px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 border transition-all cursor-pointer ' + 
                     (activeCourseIds().includes(c.id) 
                       ? 'bg-slate-50 dark:bg-slate-850 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 shadow-sm' 
                       : 'bg-transparent text-slate-400 border-dashed border-slate-200 dark:border-slate-800 opacity-60')"
          >
            <span class="w-2.5 h-2.5 rounded-full" [style.background-color]="getCourseColor(c.id)"></span>
            <span class="truncate max-w-[150px] sm:max-w-xs">{{ c.title }}</span>
            <span class="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-bold" [style.color]="getCourseColor(c.id)">
              {{ getCourseCurrentProgress(c.id) }}%
            </span>
          </button>
        }
      </div>

      <!-- Interactive Chart Area -->
      <div class="relative w-full h-[280px] sm:h-[320px] bg-slate-50/40 dark:bg-slate-950/20 rounded-2xl border border-slate-100 dark:border-slate-850 p-4 overflow-hidden" #chartContainer>
        <svg class="w-full h-full overflow-visible" #svgRef>
          <defs>
            <!-- Gradient Definitions -->
            @for (c of chartCourses(); track c.id) {
              <linearGradient [id]="'gradient-' + c.id" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" [attr.stop-color]="getCourseColor(c.id)" stop-opacity="0.25"/>
                <stop offset="100%" [attr.stop-color]="getCourseColor(c.id)" stop-opacity="0.00"/>
              </linearGradient>
            }
            <!-- Drop Shadow for Line hover points -->
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.3" flood-color="#000000"/>
            </filter>
          </defs>
          <g class="chart-content"></g>
        </svg>

        <!-- Floating Detailed Tooltip Overlay (SVG/D3 Handled or Angular HTML) -->
        @if (tooltipData(); as data) {
          <div 
            [style.left.px]="tooltipPos().x"
            [style.top.px]="tooltipPos().y"
            class="absolute pointer-events-none bg-slate-900/95 dark:bg-slate-950/98 backdrop-blur-md text-white text-xs p-3 rounded-xl border border-slate-700/80 shadow-2xl min-w-[180px] -translate-x-1/2 -translate-y-[105%] transition-all duration-75 space-y-2 z-10"
          >
            <div class="flex justify-between items-center border-b border-white/10 pb-1.5">
              <span class="font-bold text-[11px] text-slate-300 font-mono tracking-wider">{{ data.label }}</span>
              <span class="text-[10px] text-cyan-400 bg-cyan-950/40 px-1.5 py-0.5 rounded font-bold">Active Tracks</span>
            </div>
            <div class="space-y-1.5">
              @for (item of data.values; track item.courseId) {
                <div class="flex justify-between items-center gap-3">
                  <div class="flex items-center gap-1.5 min-w-0">
                    <span class="w-1.5 h-1.5 rounded-full shrink-0" [style.background-color]="item.color"></span>
                    <span class="truncate text-slate-300 text-[10px]">{{ item.title }}</span>
                  </div>
                  <span class="font-bold text-[11px] font-mono" [style.color]="item.color">{{ item.progress }}%</span>
                </div>
              }
            </div>
          </div>
        }
      </div>

      <!-- Bottom Interactive Simulator & Insights Panel -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-100 dark:border-slate-800/60">
        <!-- Progress Insights -->
        <div class="space-y-3">
          <h4 class="font-bold text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <mat-icon class="text-sm text-cyan-500">insights</mat-icon> Progression Insights
          </h4>
          <div class="grid grid-cols-2 gap-3">
            <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
              <span class="text-[10px] text-slate-500 block">Weekly Velocity</span>
              <span class="text-sm font-bold text-emerald-500 flex items-center gap-0.5 mt-0.5">
                <mat-icon class="text-sm">arrow_upward</mat-icon> +12.4%
              </span>
            </div>
            <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
              <span class="text-[10px] text-slate-500 block">Next Milestone</span>
              <span class="text-xs font-bold text-indigo-600 dark:text-cyan-400 block truncate mt-0.5" title="Syllabus Completion">
                90% In High-Fidelity SVG
              </span>
            </div>
          </div>
          <p class="text-[11px] text-slate-500 leading-relaxed">
            Based on your last 7 days of activity, you are on track to complete the <strong class="text-slate-700 dark:text-slate-300">High-Fidelity SVG Dashboards</strong> course by Friday! Keep up the daily streak.
          </p>
        </div>

        <!-- Simulation Controls -->
        <div class="p-4 rounded-2xl bg-indigo-50/30 dark:bg-slate-850/30 border border-indigo-100/50 dark:border-slate-800/40 space-y-3.5">
          <div class="flex justify-between items-center">
            <h4 class="font-bold text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <mat-icon class="text-sm text-indigo-500">sports_esports</mat-icon> Analytics Simulator
            </h4>
            <span class="text-[10px] bg-indigo-100/60 dark:bg-indigo-950/40 text-indigo-600 dark:text-cyan-400 px-2 py-0.5 rounded font-bold">Dynamic Test</span>
          </div>
          <div class="space-y-3">
            <div class="text-[11px] text-slate-500 dark:text-slate-400 flex justify-between">
              <span>Simulate Logging Study Hours Today:</span>
              <span class="font-bold text-indigo-600 dark:text-cyan-400 font-mono">+{{ simulatedBoost() }} hours</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="10" 
              step="1"
              [value]="simulatedBoost()" 
              (input)="onBoostChange($event)"
              class="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:accent-cyan-400"
            />
          </div>
          <div class="flex justify-between items-center gap-3">
            <span class="text-[10px] text-slate-400">Drastic changes will immediately recalculate the bezier curves</span>
            <button 
              (click)="resetBoost()"
              class="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 cursor-pointer shrink-0 transition-all"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: #4f46e5;
      cursor: pointer;
    }
    .dark input[type="range"]::-webkit-slider-thumb {
      background: #22d3ee;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LearningAnalytics implements OnInit, OnDestroy {
  private stateService = inject(LmsState);

  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('svgRef', { static: true }) svgRef!: ElementRef<SVGSVGElement>;

  // Component Signals
  selectedTimeframe = signal<'7d' | '4w' | 'semester'>('7d');
  activeCourseIds = signal<string[]>(['c1', 'c2', 'c3']); // Default active courses
  chartStyle = signal<'line' | 'area'>('area');
  simulatedBoost = signal<number>(0);
  
  // Tooltip interactive state signals
  tooltipData = signal<TooltipData | null>(null);
  tooltipPos = signal<{ x: number; y: number }>({ x: 0, y: 0 });

  // Available Timeframes
  timeframes: { id: '7d' | '4w' | 'semester'; name: string }[] = [
    { id: '7d', name: '7 Days' },
    { id: '4w', name: '4 Weeks' },
    { id: 'semester', name: 'Semester' }
  ];

  // Colors assigned to each course
  private courseColors: Record<string, string> = {
    c1: '#6366f1', // Indigo
    c2: '#ec4899', // Pink
    c3: '#06b6d4', // Cyan
    c4: '#10b981', // Emerald
    c5: '#f59e0b', // Amber
    c6: '#8b5cf6'  // Purple
  };

  private resizeObserver!: ResizeObserver;
  private containerWidth = signal<number>(500);
  private containerHeight = signal<number>(280);

  // Get enrolled courses from shared LMS state
  chartCourses = computed(() => {
    return this.stateService.courses();
  });

  // Dynamic D3 Graph Data based on Timeframe, Active Courses, and Simulated Boost
  graphData = computed<ChartDataPoint[]>(() => {
    const tf = this.selectedTimeframe();
    const boost = this.simulatedBoost();
    const activeIds = this.activeCourseIds();
    const courses = this.chartCourses();

    let pointsCount: number;
    let labels: string[];

    if (tf === '7d') {
      pointsCount = 7;
      labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    } else if (tf === '4w') {
      pointsCount = 4;
      labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    } else {
      pointsCount = 6;
      labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    }

    const data: ChartDataPoint[] = [];

    for (let i = 0; i < pointsCount; i++) {
      const label = labels[i] || `P${i + 1}`;
      const point: ChartDataPoint = { label };

      courses.forEach(c => {
        // Generate realistic progression path up to their current progress percentage
        const finalProgress = c.progress;
        
        // Let's model progress over time with a growth curve
        const progressFraction = (i + 1) / pointsCount;
        let baseProgress = Math.round(finalProgress * progressFraction);

        // Apply dynamic boost simulation on the last few days
        if (boost > 0 && activeIds.includes(c.id)) {
          const boostEffectFraction = i / (pointsCount - 1); // Boost weighs heavily on current day
          baseProgress = Math.min(100, Math.round(baseProgress + (boost * 3.5 * boostEffectFraction)));
        }

        point[c.id] = baseProgress;
      });

      data.push(point);
    }

    return data;
  });

  constructor() {
    // Setup effect to redraw D3 chart when layout dimensions or data change
    effect(() => {
      this.drawChart(this.graphData(), this.containerWidth(), this.containerHeight());
    });

    // Handle dark mode transitions
    effect(() => {
      // Trigger redraw when dark mode toggles to ensure grid line coloring updates correctly
      this.stateService.darkMode();
      this.drawChart(this.graphData(), this.containerWidth(), this.containerHeight());
    });
  }

  ngOnInit(): void {
    // Sync initial active IDs with actual enrolled courses
    const initialIds = this.chartCourses().map(c => c.id).slice(0, 3);
    if (initialIds.length > 0) {
      this.activeCourseIds.set(initialIds);
    }

    // Set up ResizeObserver to make the D3 SVG fully responsive to grid container changes
    if (typeof window !== 'undefined' && this.chartContainer) {
      this.resizeObserver = new ResizeObserver(entries => {
        if (!entries || entries.length === 0) return;
        const entry = entries[0];
        const { width, height } = entry.contentRect;
        
        // Only update signals if they genuinely changed to avoid cycle ref triggers
        if (Math.abs(this.containerWidth() - width) > 2 || Math.abs(this.containerHeight() - height) > 2) {
          this.containerWidth.set(width);
          this.containerHeight.set(height);
        }
      });
      this.resizeObserver.observe(this.chartContainer.nativeElement);
    }
  }

  ngOnDestroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  getCourseColor(courseId: string): string {
    return this.courseColors[courseId] || '#cbd5e1';
  }

  getCourseCurrentProgress(courseId: string): number {
    const course = this.chartCourses().find(c => c.id === courseId);
    return course ? course.progress : 0;
  }

  toggleCourseActive(courseId: string): void {
    this.activeCourseIds.update(ids => {
      if (ids.includes(courseId)) {
        // Prevent disabling all courses so chart doesn't become empty
        return ids.length > 1 ? ids.filter(id => id !== courseId) : ids;
      } else {
        return [...ids, courseId];
      }
    });
  }

  toggleChartStyle(): void {
    this.chartStyle.update(style => style === 'line' ? 'area' : 'line');
  }

  onBoostChange(event: Event): void {
    const value = +(event.target as HTMLInputElement).value;
    this.simulatedBoost.set(value);
  }

  resetBoost(): void {
    this.simulatedBoost.set(0);
  }

  // Pure D3 Render Core
  private drawChart(data: ChartDataPoint[], width: number, height: number): void {
    if (!this.svgRef || !data || data.length === 0) return;

    const svg = d3.select(this.svgRef.nativeElement);
    const g = svg.select('.chart-content');
    g.selectAll('*').remove(); // Clear previous visuals to prevent memory leaks or overlapping layers

    const margin = { top: 25, right: 20, bottom: 30, left: 35 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Apply main translation layout
    g.attr('transform', `translate(${margin.left}, ${margin.top})`);

    // --- Scales ---
    const xScale = d3.scalePoint()
      .domain(data.map(d => d.label))
      .range([0, chartWidth])
      .padding(0.1);

    const yScale = d3.scaleLinear()
      .domain([0, 100]) // Percentage progress is always 0-100%
      .range([chartHeight, 0]);

    // --- Grid Lines ---
    const isDark = this.stateService.darkMode();
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';

    // Horizontal grid lines
    const yTicks = [0, 25, 50, 75, 100];
    g.selectAll('.grid-line-y')
      .data(yTicks)
      .enter()
      .append('line')
      .attr('class', 'grid-line-y')
      .attr('x1', 0)
      .attr('x2', chartWidth)
      .attr('y1', d => yScale(d))
      .attr('y2', d => yScale(d))
      .attr('stroke', gridColor)
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '3,3');

    // --- Axes ---
    // X Axis
    const xAxis = d3.axisBottom(xScale).tickSize(0).tickPadding(10);
    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${chartHeight})`)
      .call(xAxis)
      .call(gAxis => gAxis.select('.domain').attr('stroke', isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)'))
      .call(gAxis => gAxis.selectAll('.tick text')
        .attr('fill', isDark ? '#94a3b8' : '#64748b')
        .attr('font-size', '10px')
        .attr('font-weight', '500')
        .attr('font-family', 'Inter, sans-serif')
      );

    // Y Axis (Custom styling to match Figma layouts)
    const yAxis = d3.axisLeft(yScale)
      .tickValues(yTicks)
      .tickFormat(d => `${d}%`)
      .tickSize(0)
      .tickPadding(8);

    g.append('g')
      .attr('class', 'y-axis')
      .call(yAxis)
      .call(gAxis => gAxis.select('.domain').remove()) // Hide vertical y-axis bar for a modern look
      .call(gAxis => gAxis.selectAll('.tick text')
        .attr('fill', isDark ? '#94a3b8' : '#64748b')
        .attr('font-size', '10px')
        .attr('font-weight', '600')
        .attr('font-family', 'JetBrains Mono, monospace')
      );

    // --- Draw Paths (Lines/Areas) for active courses ---
    const activeIds = this.activeCourseIds();
    const courses = this.chartCourses();

    // Setup line constructor with elegant curves
    const lineGenerator = d3.line<ChartDataPoint>()
      .x(d => xScale(d.label) || 0)
      .y(d => {
        const val = d[this.currentCourseId] !== undefined ? +(d[this.currentCourseId] as number) : 0;
        return yScale(val);
      })
      .curve(d3.curveMonotoneX); // Smooth bezier transition points

    // Setup area constructor for filled gradient layers
    const areaGenerator = d3.area<ChartDataPoint>()
      .x(d => xScale(d.label) || 0)
      .y0(chartHeight)
      .y1(d => {
        const val = d[this.currentCourseId] !== undefined ? +(d[this.currentCourseId] as number) : 0;
        return yScale(val);
      })
      .curve(d3.curveMonotoneX);

    activeIds.forEach(courseId => {
      const courseColor = this.getCourseColor(courseId);
      
      // Injecting contextual ID so line/area generators know which column to read from
      this.currentCourseId = courseId;

      // Draw Filled Area if requested
      if (this.chartStyle() === 'area') {
        g.append('path')
          .datum(data)
          .attr('class', `area-${courseId} transition-all duration-300`)
          .attr('d', areaGenerator)
          .attr('fill', `url(#gradient-${courseId})`);
      }

      // Draw Main Stroke Line
      g.append('path')
        .datum(data)
        .attr('class', `line-${courseId} transition-all duration-300`)
        .attr('d', lineGenerator)
        .attr('fill', 'none')
        .attr('stroke', courseColor)
        .attr('stroke-width', 2.5)
        .attr('stroke-linecap', 'round');
    });

    // --- Hover Interactive Tracking overlays ---
    const trackerGroup = g.append('g').attr('class', 'hover-tracker').style('display', 'none');

    // Vertical hover rule line
    const hoverLine = trackerGroup.append('line')
      .attr('y1', 0)
      .attr('y2', chartHeight)
      .attr('stroke', isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.15)')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '4,4');

    // Create interactive tracking circles for each active path
    const circles: Record<string, d3.Selection<SVGCircleElement, unknown, null, undefined>> = {};
    activeIds.forEach(courseId => {
      circles[courseId] = trackerGroup.append('circle')
        .attr('r', 5)
        .attr('fill', this.getCourseColor(courseId))
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 2)
        .attr('filter', 'url(#shadow)');
    });

    // Transparent rect to intercept all mouse positions
    g.append('rect')
      .attr('class', 'overlay')
      .attr('width', chartWidth)
      .attr('height', chartHeight)
      .attr('fill', 'transparent')
      .style('cursor', 'crosshair')
      .on('mouseover', () => trackerGroup.style('display', null))
      .on('mouseout', () => {
        trackerGroup.style('display', 'none');
        this.tooltipData.set(null); // Hide Angular floating tooltip overlay
      })
      .on('mousemove', (event) => {
        const mouseX = d3.pointer(event)[0];
        
        // Find closest point in xScale
        const domain = xScale.domain();
        
        // Simple scalepoint inversion calculation
        let closestLabel = domain[0];
        let minDiff = Infinity;
        
        domain.forEach(label => {
          const posX = xScale(label) || 0;
          const diff = Math.abs(posX - mouseX);
          if (diff < minDiff) {
            minDiff = diff;
            closestLabel = label;
          }
        });

        const selectedPoint = data.find(p => p.label === closestLabel);
        if (selectedPoint) {
          const targetX = xScale(closestLabel) || 0;
          
          // Move the vertical indicator line
          hoverLine.attr('x1', targetX).attr('x2', targetX);

          // Build values array for the dynamic tooltips
          const values: TooltipValue[] = [];

          activeIds.forEach(courseId => {
            const courseVal = selectedPoint[courseId] !== undefined ? +(selectedPoint[courseId] as number) : 0;
            const targetY = yScale(courseVal);
            
            // Position individual indicator dots on top of paths
            circles[courseId]
              .attr('cx', targetX)
              .attr('cy', targetY);

            const courseObj = courses.find(c => c.id === courseId);
            if (courseObj) {
              values.push({
                courseId,
                title: courseObj.title,
                progress: courseVal,
                color: this.getCourseColor(courseId)
              });
            }
          });

          // Sort values so highest progress is rendered first in tooltip list
          values.sort((a, b) => b.progress - a.progress);

          // Update tooltip position relative to widget wrapper
          const absoluteX = targetX + margin.left;
          const absoluteY = margin.top + 20; // Anchor on top of the vertical line
          
          this.tooltipPos.set({ x: absoluteX, y: absoluteY });
          this.tooltipData.set({
            label: closestLabel === 'Mon' || closestLabel === 'Tue' ? `${closestLabel}day Progress` : closestLabel,
            values
          });
        }
      });
  }

  // Temp state variable helper to pass courseId down generators
  private currentCourseId = '';
}
