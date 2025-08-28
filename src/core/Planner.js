import { GeminiClient } from '../api/GeminiClient.js';
import { ConfigManager } from '../utils/ConfigManager.js';
import { LoggingUtil } from '../utils/LoggingUtil.js';
import { Plan } from '../models/Plan.js';
import { ApiException } from '../exceptions/ApiException.js';

export class Planner {
  constructor() {
    this.geminiClient = new GeminiClient();
    this.config = ConfigManager.getInstance();
    this.logger = LoggingUtil.getInstance();
  }

  async createPlan(userQuery) {
    try {
      const systemPrompt = this._buildSystemPrompt();
      const userPrompt = `User request: "${userQuery}"

Please analyze this request and create a structured execution plan. Consider:
1. What the user wants to accomplish
2. The safest way to achieve it
3. Any potential risks or side effects
4. Whether confirmation is needed for each step

Respond with valid JSON only.`;

      const response = await this.geminiClient.generateStructuredResponse(
        systemPrompt,
        userPrompt
      );

      const planData = this._parseAndValidatePlan(response);
      const plan = new Plan(planData);
      
      this.logger.info('Plan created successfully', { 
        userQuery, 
        stepCount: plan.steps.length,
        riskLevel: plan.riskLevel 
      });

      return plan;
    } catch (error) {
      this.logger.error('Failed to create plan', { userQuery, error: error.message });
      throw new ApiException(`Failed to create execution plan: ${error.message}`);
    }
  }

  _buildSystemPrompt() {
    return `You are Forge, an AI assistant that converts natural language requests into safe, structured execution plans.

Your role is to:
1. Understand user intent from natural language
2. Break down complex tasks into discrete steps
3. Identify potential risks and safety concerns
4. Generate executable commands for each step

CRITICAL REQUIREMENTS:
- Always respond with valid JSON only
- Never suggest destructive operations without explicit confirmation
- Flag any potentially risky operations
- Provide rollback strategies when possible
- Use standard shell commands that work across Unix-like systems

Response format (JSON only):
{
  "intent": "Clear description of what the user wants to accomplish",
  "steps": [
    {
      "id": "step-1",
      "description": "Human-readable description of this step",
      "command": "actual shell command to execute",
      "requiresConfirmation": true|false,
      "riskLevel": "none|low|medium|high",
      "workingDirectory": "path where command should run (optional)"
    }
  ],
  "riskLevel": "none|low|medium|high",
  "rollback": "Commands to undo the operation if something goes wrong",
  "estimatedDuration": "rough time estimate",
  "prerequisites": ["list of requirements or dependencies"]
}

Risk levels:
- none: Safe operations (ls, cat, echo, etc.)
- low: File operations in user directories
- medium: System configuration changes, package installations
- high: Destructive operations, system-wide changes

Always err on the side of caution and require confirmation for anything that could cause data loss or system instability.`;
  }

  _parseAndValidatePlan(response) {
    try {
      // Extract JSON from response if it's wrapped in markdown or other text
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : response;
      
      const planData = JSON.parse(jsonStr);
      
      // Validate required fields
      if (!planData.intent || !planData.steps || !Array.isArray(planData.steps)) {
        throw new Error('Invalid plan structure: missing required fields');
      }

      // Validate each step
      planData.steps.forEach((step, index) => {
        if (!step.id || !step.command || !step.description) {
          throw new Error(`Invalid step ${index}: missing required fields`);
        }
        
        // Set defaults
        step.requiresConfirmation = step.requiresConfirmation ?? false;
        step.riskLevel = step.riskLevel ?? 'low';
        step.workingDirectory = step.workingDirectory ?? process.cwd();
      });

      // Set defaults for plan
      planData.riskLevel = planData.riskLevel ?? 'low';
      planData.rollback = planData.rollback ?? 'No automatic rollback available';
      planData.estimatedDuration = planData.estimatedDuration ?? 'Unknown';
      planData.prerequisites = planData.prerequisites ?? [];

      return planData;
    } catch (error) {
      throw new Error(`Failed to parse plan response: ${error.message}`);
    }
  }

  async refinePlan(plan, userFeedback) {
    try {
      const refinementPrompt = `The user has provided feedback on the execution plan:
      
Original plan: ${JSON.stringify(plan.toJSON(), null, 2)}
User feedback: "${userFeedback}"

Please refine the plan based on this feedback. Respond with the updated JSON plan using the same format.`;

      const response = await this.geminiClient.generateStructuredResponse(
        this._buildSystemPrompt(),
        refinementPrompt
      );

      const refinedPlanData = this._parseAndValidatePlan(response);
      return new Plan(refinedPlanData);
    } catch (error) {
      throw new ApiException(`Failed to refine plan: ${error.message}`);
    }
  }
}