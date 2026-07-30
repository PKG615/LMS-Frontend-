import { Component, ElementRef, ViewChild, signal, effect, computed, OnDestroy, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { LmsState } from '../../state';
import * as d3 from 'd3';

interface AnalyticsPoint {
  day: string;
  label: string;
  hours: number;
  progress: number;
}

interface TooltipDetails {
  label: string;
  hours: number;
  progress: number;
  courseTitle: string;
}

@Component({
  selector: 'app-learning-analytics-chart',
  imports: [CommonModule, MatIconModule],
  template: `
    <div id="learning-analytics-chart-card" class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 shadow-sm space-y-6 transition-all">
      
      <!-- Component Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <span class="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500">
              <mat-icon class="text-lg">bar_chart</mat-icon>
            </span>
            <h3 class="font-bold text-lg text-slate-800 dark:text-slate-200">Study Velocity vs. Progress</h3>
          </div>
          <p class="text-xs text-slate-500">Dual-axis analysis correlating logged study hours with course milestones over the current week</p>
        </div>

        <!-- Course Selector Dropdown -->
        @if (courses().length > 0) {
          <div class="relative shrink-0">
            <select 
              (change)="onCourseChange($event)" 
              [value]="selectedCourseId()" 
              class="appearance-none pl-3 pr-8 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/40 dark:border-slate-700/40 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              id="course-progress-dropdown"
            >
              @for (c of courses(); track c.id) {
                <option [value]="c.id">{{ c.title }}</option>
              }
            </select>
            <mat-icon class="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">expand_more</mat-icon>
          </div>
        }
      </div>

      <!-- Chart Metrics Badges -->
      <div class="flex flex-wrap items-center gap-4 text-xs font-medium">
        <div class="flex items-center gap-2 bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800/60 px-3.5 py-2 rounded-xl">
          <span class="w-3 h-3 rounded bg-indigo-500 dark:bg-indigo-400 shrink-0"></span>
          <span class="text-slate-500">Study Hours (Total: <strong>{{ totalHours() }} hrs</strong>)</span>
        </div>
        <div class="flex items-center gap-2 bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800/60 px-3.5 py-2 rounded-xl">
          <span class="w-3 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 shrink-0"></span>
          <span class="text-slate-500">Milestone Progress (Currently: <strong class="text-emerald-500">{{ currentProgress() }}%</strong>)</span>
        </div>
      </div>

      <!-- Main Visualized Container -->
      <div class="relative w-full h-[300px] sm:h-[340px] bg-slate-50/40 dark:bg-slate-950/20 rounded-2xl border border-slate-100 dark:border-slate-850 p-4" #chartContainer>
        <svg class="w-full h-full overflow-visible" #svgRef>
          <defs>
            <!-- Rounded bars masking pattern / clipping if needed, though we can draw rounded paths directly -->
            <linearGradient id="bar-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#6366f1" stop-opacity="0.85"/>
              <stop offset="100%" stop-color="#4f46e5" stop-opacity="0.4"/>
            </linearGradient>
            
            <linearGradient id="progress-line-gradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stop-color="#10b981"/>
              <stop offset="100%" stop-color="#059669"/>
            </linearGradient>

            <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          <g class="chart-content"></g>
        </svg>

        <!-- Floating Glassmorphism Tooltip -->
        @if (tooltipData(); as data) {
          <div 
            [style.left.px]="tooltipPos().x"
            [style.top.px]="tooltipPos().y"
            class="absolute pointer-events-none bg-slate-900/90 dark:bg-slate-950/95 backdrop-blur-md text-white text-xs p-3.5 rounded-2xl border border-slate-700/60 shadow-2xl min-w-[200px] -translate-x-1/2 -translate-y-[110%] transition-all duration-75 space-y-2.5 z-10"
          >
            <div class="flex justify-between items-center border-b border-white/10 pb-1.5">
              <span class="font-bold text-[11px] text-slate-300 font-mono tracking-wider">{{ data.label }}day Analysis</span>
              <span class="text-[9px] font-bold text-indigo-400 bg-indigo-950/50 px-2 py-0.5 rounded">Active Slot</span>
            </div>
            <div class="space-y-1.5">
              <div class="flex justify-between items-center gap-3">
                <div class="flex items-center gap-1.5 min-w-0">
                  <span class="w-2 h-2 rounded bg-indigo-500 shrink-0"></span>
                  <span class="text-slate-400 text-[10px]">Study Tracked</span>
                </div>
                <span class="font-bold text-[11px] font-mono text-indigo-300">{{ data.hours }} hrs</span>
              </div>
              <div class="flex justify-between items-center gap-3">
                <div class="flex items-center gap-1.5 min-w-0">
                  <span class="w-2 h-2 rounded bg-emerald-500 shrink-0"></span>
                  <span class="text-slate-400 text-[10px] truncate" [title]="data.courseTitle">{{ data.courseTitle }}</span>
                </div>
                <span class="font-bold text-[11px] font-mono text-emerald-400">{{ data.progress }}%</span>
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Action Footer Slider Simulator -->
      <div class="p-4 rounded-2xl bg-indigo-50/20 dark:bg-slate-850/20 border border-indigo-100/40 dark:border-slate-800/30 flex flex-col md:flex-row items-center justify-between gap-4">
        <div class="space-y-1 w-full md:w-2/3">
          <div class="flex justify-between text-xs">
            <span class="font-bold text-slate-700 dark:text-slate-300">Simulate Today's Study Boost:</span>
            <span class="font-mono text-indigo-600 dark:text-cyan-400 font-bold">+{{ boostHours() }} Hours</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="6" 
            step="0.5" 
            [value]="boostHours()" 
            (input)="onBoostSliderChange($event)"
            class="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:accent-cyan-400"
            id="simulation-study-slider"
          />
        </div>
        <button 
          (click)="resetBoost()" 
          [disabled]="boostHours() === 0"
          class="w-full md:w-auto px-4 py-2.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          type="button"
        >
          Reset Boost
        </button>
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
export class LearningAnalyticsChart implements OnInit, OnDestroy {
  private readonly stateService = inject(LmsState);

  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('svgRef', { static: true }) svgRef!: ElementRef<SVGSVGElement>;

  // Component State signals
  selectedCourseId = signal<string>('c1');
  boostHours = signal<number>(0);
  
  // Tooltip dynamic coordinates & values
  tooltipData = signal<TooltipDetails | null>(null);
  tooltipPos = signal<{ x: number; y: number }>({ x: 0, y: 0 });

  // Dimension tracking
  private resizeObserver!: ResizeObserver;
  private containerWidth = signal<number>(500);
  private containerHeight = signal<number>(300);

  // Enrolled courses computed from LmsState
  courses = computed(() => this.stateService.courses());

  // Currently selected course object
  selectedCourse = computed(() => {
    const id = this.selectedCourseId();
    return this.courses().find(c => c.id === id) || this.courses()[0];
  });

  // Dynamic values based on selected course
  currentProgress = computed(() => {
    const c = this.selectedCourse();
    return c ? c.progress : 0;
  });

  // Base raw weekly study hours data (realistic profile per day of week)
  private readonly baseHours: Record<string, number> = {
    Mon: 3.5,
    Tue: 5.0,
    Wed: 4.2,
    Thu: 6.5,
    Fri: 4.8,
    Sat: 2.0,
    Sun: 1.5
  };

  // Compute final weekly points
  chartPoints = computed<AnalyticsPoint[]>(() => {
    const activeCourse = this.selectedCourse();
    const finalProgress = activeCourse ? activeCourse.progress : 0;
    const boost = this.boostHours();
    
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const count = days.length;

    return days.map((day, index) => {
      // Study hours: Base study hours + boost applied to today (represented by Sunday)
      let hours = this.baseHours[day] || 0;
      if (day === 'Sun') {
        hours = Math.round((hours + boost) * 10) / 10;
      }

      // Progress fraction growth leading up to the final progress percentage
      // We assume progress grows gradually during the week
      const stepFraction = (index + 1) / count;
      const baseProgress = Math.round(finalProgress * (0.8 + 0.2 * stepFraction));
      const progress = Math.min(100, baseProgress);

      return {
        day,
        label: day === 'Mon' || day === 'Tue' ? `${day}day` : day,
        hours,
        progress
      };
    });
  });

  // Calculated overall hours
  totalHours = computed(() => {
    const points = this.chartPoints();
    return Math.round(points.reduce((sum, p) => sum + p.hours, 0) * 10) / 10;
  });

  constructor() {
    // Redraw on data, dimensions or theme changes
    effect(() => {
      this.drawChart(this.chartPoints(), this.containerWidth(), this.containerHeight());
    });

    effect(() => {
      // Hook change detection to dark mode transition
      this.stateService.darkMode();
      this.drawChart(this.chartPoints(), this.containerWidth(), this.containerHeight());
    });
  }

  ngOnInit(): void {
    // Set default selected course
    const list = this.courses();
    if (list.length > 0) {
      this.selectedCourseId.set(list[0].id);
    }

    // Initialize ResizeObserver
    if (typeof window !== 'undefined' && this.chartContainer) {
      this.resizeObserver = new ResizeObserver(entries => {
        if (!entries || entries.length === 0) return;
        const entry = entries[0];
        const { width, height } = entry.contentRect;

        // Debounce slightly by checking minimal changes
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

  onCourseChange(event: Event): void {
    const id = (event.target as HTMLSelectElement).value;
    this.selectedCourseId.set(id);
  }

  onBoostSliderChange(event: Event): void {
    const val = +(event.target as HTMLInputElement).value;
    this.boostHours.set(val);
  }

  resetBoost(): void {
    this.boostHours.set(0);
  }

  // Pure D3 Rendering Engine
  private drawChart(data: AnalyticsPoint[], width: number, height: number): void {
    if (!this.svgRef || !data || data.length === 0) return;

    const svg = d3.select(this.svgRef.nativeElement);
    const g = svg.select('.chart-content');
    g.selectAll('*').remove(); // Evade overlap duplication

    const margin = { top: 20, right: 35, bottom: 25, left: 35 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    g.attr('transform', `translate(${margin.left}, ${margin.top})`);

    // --- Scales ---
    const xScale = d3.scaleBand()
      .domain(data.map(d => d.day))
      .range([0, chartWidth])
      .padding(0.35);

    // Left Y Axis: Study Hours (0 to max hours found, min 8 for layout stability)
    const maxHours = d3.max(data, d => d.hours) || 6;
    const yHoursScale = d3.scaleLinear()
      .domain([0, Math.max(8, Math.ceil(maxHours))])
      .range([chartHeight, 0]);

    // Right Y Axis: Course Progress (0% to 100%)
    const yProgressScale = d3.scaleLinear()
      .domain([0, 100])
      .range([chartHeight, 0]);

    // --- Grid Lines ---
    const isDark = this.stateService.darkMode();
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)';

    // Horizontal grids keyed off progress ticks
    const ticks = [0, 25, 50, 75, 100];
    g.selectAll('.grid-line')
      .data(ticks)
      .enter()
      .append('line')
      .attr('class', 'grid-line')
      .attr('x1', 0)
      .attr('x2', chartWidth)
      .attr('y1', d => yProgressScale(d))
      .attr('y2', d => yProgressScale(d))
      .attr('stroke', gridColor)
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '3,3');

    // --- Axes ---
    // X Axis
    const xAxis = d3.axisBottom(xScale).tickSize(0).tickPadding(8);
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

    // Left Y Axis (Study Hours)
    const leftAxisTicks = [0, 2, 4, 6, 8, 10].filter(t => t <= yHoursScale.domain()[1]);
    const yHoursAxis = d3.axisLeft(yHoursScale)
      .tickValues(leftAxisTicks)
      .tickFormat(d => `${d}h`)
      .tickSize(0)
      .tickPadding(6);

    g.append('g')
      .attr('class', 'y-hours-axis')
      .call(yHoursAxis)
      .call(gAxis => gAxis.select('.domain').remove())
      .call(gAxis => gAxis.selectAll('.tick text')
        .attr('fill', isDark ? '#818cf8' : '#4f46e5')
        .attr('font-size', '9px')
        .attr('font-weight', '600')
        .attr('font-family', 'JetBrains Mono, monospace')
      );

    // Right Y Axis (Course Progress)
    const yProgressAxis = d3.axisRight(yProgressScale)
      .tickValues(ticks)
      .tickFormat(d => `${d}%`)
      .tickSize(0)
      .tickPadding(6);

    g.append('g')
      .attr('class', 'y-progress-axis')
      .attr('transform', `translate(${chartWidth}, 0)`)
      .call(yProgressAxis)
      .call(gAxis => gAxis.select('.domain').remove())
      .call(gAxis => gAxis.selectAll('.tick text')
        .attr('fill', isDark ? '#34d399' : '#10b981')
        .attr('font-size', '9px')
        .attr('font-weight', '600')
        .attr('font-family', 'JetBrains Mono, monospace')
      );

    // --- Draw Study Hours Bars ---
    // We will draw custom SVG path elements for beautiful rounded tops, or use standard rects with rx/ry
    g.selectAll('.study-bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'study-bar transition-all duration-300')
      .attr('x', d => xScale(d.day) || 0)
      .attr('y', d => yHoursScale(d.hours))
      .attr('width', xScale.bandwidth())
      .attr('height', d => chartHeight - yHoursScale(d.hours))
      .attr('rx', 6) // Smooth rounded pill tops
      .attr('ry', 6)
      .attr('fill', 'url(#bar-gradient)');

    // --- Draw Course Progress Line ---
    const lineGenerator = d3.line<AnalyticsPoint>()
      .x(d => (xScale(d.day) || 0) + xScale.bandwidth() / 2)
      .y(d => yProgressScale(d.progress))
      .curve(d3.curveMonotoneX);

    // Underlay glowing path shadow
    g.append('path')
      .datum(data)
      .attr('d', lineGenerator)
      .attr('fill', 'none')
      .attr('stroke', isDark ? '#059669' : '#10b981')
      .attr('stroke-width', 5)
      .attr('stroke-linecap', 'round')
      .attr('opacity', 0.2)
      .attr('filter', 'url(#neon-glow)');

    // Primary Neon Line Path
    g.append('path')
      .datum(data)
      .attr('d', lineGenerator)
      .attr('fill', 'none')
      .attr('stroke', 'url(#progress-line-gradient)')
      .attr('stroke-width', 2.5)
      .attr('stroke-linecap', 'round');

    // Add points/dots on the progress line
    g.selectAll('.progress-dot')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'progress-dot cursor-pointer transition-transform duration-200 hover:scale-150')
      .attr('cx', d => (xScale(d.day) || 0) + xScale.bandwidth() / 2)
      .attr('cy', d => yProgressScale(d.progress))
      .attr('r', 4.5)
      .attr('fill', isDark ? '#10b981' : '#ffffff')
      .attr('stroke', isDark ? '#064e3b' : '#10b981')
      .attr('stroke-width', 2);

    // --- Hover Interactive Tracking Overlay ---
    const trackerGroup = g.append('g').attr('class', 'hover-tracker').style('display', 'none');

    const hoverLine = trackerGroup.append('line')
      .attr('y1', 0)
      .attr('y2', chartHeight)
      .attr('stroke', isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '4,4');

    // Tracker circles for study hours (left scale) and progress percentage (right scale)
    const hourTrackerDot = trackerGroup.append('circle')
      .attr('r', 5)
      .attr('fill', '#4f46e5')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2);

    const progressTrackerDot = trackerGroup.append('circle')
      .attr('r', 5)
      .attr('fill', '#10b981')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2);

    // Large transparent interceptor rectangle for capture tracking
    g.append('rect')
      .attr('class', 'overlay')
      .attr('width', chartWidth)
      .attr('height', chartHeight)
      .attr('fill', 'transparent')
      .style('cursor', 'crosshair')
      .on('mouseover', () => trackerGroup.style('display', null))
      .on('mouseout', () => {
        trackerGroup.style('display', 'none');
        this.tooltipData.set(null);
      })
      .on('mousemove', (event) => {
        const mouseX = d3.pointer(event)[0];
        
        // Find closest band based on mouseX
        const domain = xScale.domain();
        let closestDay = domain[0];
        let minDiff = Infinity;

        domain.forEach(day => {
          const posX = (xScale(day) || 0) + xScale.bandwidth() / 2;
          const diff = Math.abs(posX - mouseX);
          if (diff < minDiff) {
            minDiff = diff;
            closestDay = day;
          }
        });

        const point = data.find(p => p.day === closestDay);
        if (point) {
          const targetX = (xScale(closestDay) || 0) + xScale.bandwidth() / 2;
          
          hoverLine.attr('x1', targetX).attr('x2', targetX);
          
          const targetHoursY = yHoursScale(point.hours);
          const targetProgressY = yProgressScale(point.progress);

          hourTrackerDot.attr('cx', targetX).attr('cy', targetHoursY);
          progressTrackerDot.attr('cx', targetX).attr('cy', targetProgressY);

          // Update floating card overlay
          const absoluteX = targetX + margin.left;
          const absoluteY = Math.min(targetHoursY, targetProgressY) + margin.top;

          this.tooltipPos.set({ x: absoluteX, y: absoluteY });
          this.tooltipData.set({
            label: point.label,
            hours: point.hours,
            progress: point.progress,
            courseTitle: this.selectedCourse() ? this.selectedCourse().title : 'Course'
          });
        }
      });
  }
}
